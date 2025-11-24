import frappe

@frappe.whitelist()
def get_sidebar_data(tab_type=None):
    """
    tab_type: 'inbox', 'tasks', or 'performance'
    """
    current_user = frappe.session.user
    user_roles = frappe.get_roles(current_user)

    # Security Check
    allowed_roles = {"ALL", "Desk User", "System Manager", "System User", "Administrator"}
    if not set(user_roles).intersection(allowed_roles):
        return {"visible": False}

    data = []
    user_email = frappe.db.get_value("User", current_user, "email")

    # 1. Performance (ToDos)
    if tab_type == 'performance':
        data = frappe.get_list("ToDo",
            filters={"allocated_to": current_user, "status": "Open"},
            fields=["name", "description", "date", "priority"],
            order_by="modified desc",
            limit=20
        )

    # 2. Tasks
    elif tab_type == 'tasks':
        data = frappe.get_list("Task",
            filters={"status": ["!=", "Completed"]}, 
            fields=["subject", "name", "exp_end_date", "priority"],
            order_by="modified desc",
            limit=20
        )

    # 3. Inbox (Emails)
    elif tab_type == 'inbox':
        if user_email:
            data = frappe.get_list("Communication",
                filters={
                    "communication_type": "Communication",
                    "communication_medium": "Email",
                    "sent_or_received": "Received",
                    "recipients": ["like", f"%{user_email}%"]
                },
                fields=["subject", "sender", "creation", "name", "reference_doctype", "reference_name", "content"],
                order_by="creation desc",
                limit=20
            )

    return {
        "visible": True,
        "type": tab_type,
        "data": data
    }


def notify_user_sidebar(doc, method):
    """
    Publish a realtime event to specific users when 
    Communication, Task, or ToDo is created/updated.
    """
    users_to_notify = []

    # 1. Emails (Communication)
    if doc.doctype == "Communication" and doc.communication_medium == "Email":
        # Check recipients (this is a simplified check, you might need to parse emails)
        if doc.recipients:
            # Find users with this email
            users = frappe.get_all("User", filters={"email": ["in", doc.recipients]}, pluck="name")
            users_to_notify.extend(users)

    # 2. Tasks
    elif doc.doctype == "Task":
        # Notify the person the task is assigned to (Owner or explicit field)
        # Assuming 'allocated_to' or checking owner if not allocated
        if hasattr(doc, 'allocated_to') and doc.allocated_to:
             users_to_notify.append(doc.allocated_to)
        else:
             users_to_notify.append(doc.owner)

    # 3. ToDo (Performance)
    elif doc.doctype == "ToDo":
        if doc.allocated_to:
            users_to_notify.append(doc.allocated_to)

    # --- Push the Socket Event ---
    for user in set(users_to_notify):
        if user:
            frappe.publish_realtime(
                event='focus_sidebar_refresh',  # <--- Custom Event Name
                message={'doctype': doc.doctype},
                user=user  # <--- Only notify this specific user
            )
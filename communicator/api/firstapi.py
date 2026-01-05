# import frappe
# import json

# @frappe.whitelist()
# def get_sidebar_config():
#     user = frappe.session.user
#     user_roles = frappe.get_roles(user)
    
#     all_tabs = frappe.get_all("Focus Sidebar Tab", 
#         fields=["name", "tab_id", "tab_label", "icon", "color", "is_public", "source_doctype"],
#         filters={"enable": 1},
#         order_by="idx asc"
#     )
    
#     hidden_tabs_str = frappe.defaults.get_user_default("focus_sidebar_hidden_tabs")
#     hidden_tabs = json.loads(hidden_tabs_str) if hidden_tabs_str else []

#     final_tabs = []
#     for tab in all_tabs:
#         if tab.tab_id in hidden_tabs: continue
#         if has_access(tab.name, tab.is_public, user, user_roles):
#             final_tabs.append({
#                 "id": tab.tab_id,
#                 "label": tab.tab_label,
#                 "icon": tab.icon,
#                 "color": tab.color,
#                 "source_doctype": tab.source_doctype
#             })

#     return {"tabs": final_tabs}

# def has_access(doc_name, is_public, user, user_roles):
#     if is_public: return True
#     allowed_users = frappe.get_all("Sidebar Allowed User", filters={"parent": doc_name}, pluck="user")
#     if user in allowed_users: return True
#     allowed_roles = frappe.get_all("Sidebar Allowed Role", filters={"parent": doc_name}, pluck="role")
#     if set(user_roles) & set(allowed_roles): return True
#     return False

# @frappe.whitelist()
# def toggle_user_preference(tab_id, hide=True):
#     hide = frappe.parse_json(hide)
#     user_list_str = frappe.defaults.get_user_default("focus_sidebar_hidden_tabs")
#     current_list = json.loads(user_list_str) if user_list_str else []

#     if hide:
#         if tab_id not in current_list: current_list.append(tab_id)
#     else:
#         if tab_id in current_list: current_list.remove(tab_id)
            
#     frappe.defaults.set_user_default("focus_sidebar_hidden_tabs", json.dumps(current_list))
#     return True

# # --- NEW FUNCTION TO FIX UNHIDE ERROR ---
# @frappe.whitelist()
# def reset_user_preferences():
#     """Resets the hidden tabs list to empty"""
#     frappe.defaults.set_user_default("focus_sidebar_hidden_tabs", "[]")
#     return True

# # @frappe.whitelist()
# # def get_sidebar_data(tab_id):
# #     try:
# #         config = frappe.get_doc("Focus Sidebar Tab", {"tab_id": tab_id})
# #     except frappe.DoesNotExistError: return {"visible": False}
        
# #     if not config.enable: return {"visible": False}
# #     if not has_access(config.name, config.is_public, frappe.session.user, frappe.get_roles()):
# #          return {"visible": False, "error": "Unauthorized"}

# #     filters = json.loads(config.filter_json) if config.filter_json else {}
# #     fields_to_fetch = ["name", "modified"] 
# #     mapping = { "title": config.field_title, "desc": config.field_description, "date": config.field_date, "badge": config.field_badge }
# #     for k, v in mapping.items():
# #         if v and v not in fields_to_fetch: fields_to_fetch.append(v)

# #     try:
# #         data = frappe.get_list(config.source_doctype, fields=fields_to_fetch, filters=filters, order_by=f"{config.field_date} desc" if config.field_date else "modified desc", limit_page_length=20)
# #     except Exception as e:
# #         return {"visible": True, "data": [], "error": str(e)}

# #     normalized_data = []
# #     for item in data:
# #         raw_date = item.get(config.field_date)
# #         if not raw_date: raw_date = item.modified # Date Fallback
        
# #         normalized_data.append({
# #             "name": item.name,
# #             "route_doctype": config.route_doctype,
# #             "title": item.get(config.field_title) or item.name,
# #             "description": str(item.get(config.field_description, "")),
# #             "date": str(raw_date) if raw_date else "",
# #             "badge": item.get(config.field_badge)
# #         })

# #     return {"visible": True, "data": normalized_data}

# @frappe.whitelist()
# def get_sidebar_data(tab_id):
#     try:
#         config = frappe.get_doc("Focus Sidebar Tab", {"tab_id": tab_id})
#     except frappe.DoesNotExistError: return {"visible": False}
        
#     if not config.enable: return {"visible": False}
#     if not has_access(config.name, config.is_public, frappe.session.user, frappe.get_roles()):
#          return {"visible": False, "error": "Unauthorized"}

#     filters = json.loads(config.filter_json) if config.filter_json else {}
    
#     # --- FIX START: Employee Filter Logic ---
#     # 1. Initialize variable to None to prevent "UnboundLocalError"
#     employee = None 

#     # 2. Check if the DocType (e.g., Goal, ToDo) actually has an "employee" field
#     if frappe.get_meta(config.source_doctype).has_field("employee"):
#         # 3. Fetch the Employee linked to the current logged-in User
#         employee = frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "name")
        
#         # 4. If an employee record exists, apply the filter
#         if employee:
#             filters["employee"] = employee
#     # --- FIX END ---

#     fields_to_fetch = ["name", "modified"] 
#     mapping = { "title": config.field_title, "desc": config.field_description, "date": config.field_date, "badge": config.field_badge }
#     for k, v in mapping.items():
#         if v and v not in fields_to_fetch: fields_to_fetch.append(v)

#     try:
#         data = frappe.get_list(config.source_doctype, fields=fields_to_fetch, filters=filters, order_by=f"{config.field_date} desc" if config.field_date else "modified desc", limit_page_length=20)
#     except Exception as e:
#         return {"visible": True, "data": [], "error": str(e)}

#     normalized_data = []
#     for item in data:
#         raw_date = item.get(config.field_date)
#         if not raw_date: raw_date = item.modified # Date Fallback
        
#         normalized_data.append({
#             "name": item.name,
#             "route_doctype": config.route_doctype,
#             "title": item.get(config.field_title) or item.name,
#             "description": str(item.get(config.field_description, "")),
#             "date": str(raw_date) if raw_date else "",
#             "badge": item.get(config.field_badge)
#         })

#     return {"visible": True, "data": normalized_data}

import frappe
import json

@frappe.whitelist()
def get_sidebar_config():
    user = frappe.session.user
    user_roles = frappe.get_roles(user)
    
    all_tabs = frappe.get_all("Focus Sidebar Tab", 
        fields=["name", "tab_id", "tab_label", "icon", "color", "is_public", "source_doctype"],
        filters={"enable": 1},
        order_by="idx asc"
    )
    
    hidden_tabs_str = frappe.defaults.get_user_default("focus_sidebar_hidden_tabs")
    hidden_tabs = json.loads(hidden_tabs_str) if hidden_tabs_str else []

    final_tabs = []
    for tab in all_tabs:
        if tab.tab_id in hidden_tabs: continue
        if has_access(tab.name, tab.is_public, user, user_roles):
            final_tabs.append({
                "id": tab.tab_id,
                "label": tab.tab_label,
                "icon": tab.icon,
                "color": tab.color,
                "source_doctype": tab.source_doctype
            })

    return {"tabs": final_tabs}

def has_access(doc_name, is_public, user, user_roles):
    if is_public: return True
    allowed_users = frappe.get_all("Sidebar Allowed User", filters={"parent": doc_name}, pluck="user")
    if user in allowed_users: return True
    allowed_roles = frappe.get_all("Sidebar Allowed Role", filters={"parent": doc_name}, pluck="role")
    if set(user_roles) & set(allowed_roles): return True
    return False

@frappe.whitelist()
def toggle_user_preference(tab_id, hide=True):
    hide = frappe.parse_json(hide)
    user_list_str = frappe.defaults.get_user_default("focus_sidebar_hidden_tabs")
    current_list = json.loads(user_list_str) if user_list_str else []

    if hide:
        if tab_id not in current_list: current_list.append(tab_id)
    else:
        if tab_id in current_list: current_list.remove(tab_id)
            
    frappe.defaults.set_user_default("focus_sidebar_hidden_tabs", json.dumps(current_list))
    return True

@frappe.whitelist()
def reset_user_preferences():
    """Resets the hidden tabs list to empty"""
    frappe.defaults.set_user_default("focus_sidebar_hidden_tabs", "[]")
    return True

@frappe.whitelist()
def get_sidebar_data(tab_id):
    try:
        config = frappe.get_doc("Focus Sidebar Tab", {"tab_id": tab_id})
    except frappe.DoesNotExistError: return {"visible": False}
        
    if not config.enable: return {"visible": False}
    if not has_access(config.name, config.is_public, frappe.session.user, frappe.get_roles()):
         return {"visible": False, "error": "Unauthorized"}

    filters = json.loads(config.filter_json) if config.filter_json else {}
    
    # --- FIX START: Employee Filter Logic ---
    # Only restrict data to "My Data" if the user is NOT Administrator.
    # Administrator should see everything.
    if frappe.session.user != "Administrator":
        # Check if the DocType (e.g., Goal, ToDo) actually has an "employee" field
        if frappe.get_meta(config.source_doctype).has_field("employee"):
            # Fetch the Employee linked to the current logged-in User
            employee = frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "name")
            
            # If an employee record exists, apply the filter
            if employee:
                filters["employee"] = employee
    # --- FIX END ---

    fields_to_fetch = ["name", "modified"] 
    mapping = { "title": config.field_title, "desc": config.field_description, "date": config.field_date, "badge": config.field_badge }
    for k, v in mapping.items():
        if v and v not in fields_to_fetch: fields_to_fetch.append(v)

    try:
        data = frappe.get_list(config.source_doctype, fields=fields_to_fetch, filters=filters, order_by=f"{config.field_date} desc" if config.field_date else "modified desc", limit_page_length=20)
    except Exception as e:
        return {"visible": True, "data": [], "error": str(e)}

    normalized_data = []
    for item in data:
        raw_date = item.get(config.field_date)
        if not raw_date: raw_date = item.modified # Date Fallback
        
        normalized_data.append({
            "name": item.name,
            "route_doctype": config.route_doctype,
            "title": item.get(config.field_title) or item.name,
            "description": str(item.get(config.field_description, "")),
            "date": str(raw_date) if raw_date else "",
            "badge": item.get(config.field_badge)
        })

    return {"visible": True, "data": normalized_data}
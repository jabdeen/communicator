# Project Documentation

Generated on: Wed Dec 10 06:39:33 AM UTC 2025

## Directory Structure
```
.
├── api
│   ├── firstapi.py
│   └── secondapi.py
├── communicator
│   ├── doctype
│   │   ├── focus_sidebar_tab
│   │   │   ├── focus_sidebar_tab.js
│   │   │   ├── focus_sidebar_tab.json
│   │   │   ├── focus_sidebar_tab.py
│   │   │   ├── __init__.py
│   │   │   └── test_focus_sidebar_tab.py
│   │   ├── __init__.py
│   │   ├── sidebar_allowed_role
│   │   │   ├── __init__.py
│   │   │   ├── sidebar_allowed_role.json
│   │   │   └── sidebar_allowed_role.py
│   │   └── sidebar_allowed_user
│   │       ├── __init__.py
│   │       ├── sidebar_allowed_user.json
│   │       └── sidebar_allowed_user.py
│   └── __init__.py
├── config
│   └── __init__.py
├── document_project.sh
├── hooks.py
├── __init__.py
├── modules.txt
├── patches.txt
├── project_documentation.md
├── public
│   ├── css
│   └── js
│       ├── focus_sidebar.js
│       └── secondsidebar.js
├── templates
│   ├── includes
│   ├── __init__.py
│   └── pages
│       └── __init__.py
└── www

14 directories, 26 files
```

## File Contents

### File: ./api/firstapi.py
```
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
```

### File: ./api/secondapi.py
```
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
```

### File: ./communicator/doctype/focus_sidebar_tab/focus_sidebar_tab.js
```
// Copyright (c) 2025, Jibreel  and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Focus Sidebar Tab", {
// 	refresh(frm) {

// 	},
// });

```

### File: ./communicator/doctype/focus_sidebar_tab/focus_sidebar_tab.json
```
{
 "actions": [],
 "allow_rename": 1,
 "creation": "2025-11-25 09:30:00.301303",
 "doctype": "DocType",
 "editable_grid": 1,
 "engine": "InnoDB",
 "field_order": [
  "tab_id",
  "tab_label",
  "icon",
  "color",
  "enable",
  "source_doctype",
  "route_doctype",
  "filter_json",
  "field_title",
  "field_description",
  "field_date",
  "field_badge",
  "is_public",
  "roles",
  "users"
 ],
 "fields": [
  {
   "fieldname": "tab_id",
   "fieldtype": "Data",
   "in_list_view": 1,
   "label": "Tab ID",
   "reqd": 1
  },
  {
   "fieldname": "tab_label",
   "fieldtype": "Data",
   "in_list_view": 1,
   "label": "Tab Label",
   "reqd": 1
  },
  {
   "fieldname": "icon",
   "fieldtype": "Data",
   "in_list_view": 1,
   "label": "Icon",
   "reqd": 1
  },
  {
   "fieldname": "color",
   "fieldtype": "Data",
   "in_list_view": 1,
   "label": "Color",
   "reqd": 1
  },
  {
   "default": "0",
   "fieldname": "enable",
   "fieldtype": "Check",
   "label": "Enable"
  },
  {
   "fieldname": "source_doctype",
   "fieldtype": "Link",
   "label": "Source Doctype",
   "options": "DocType",
   "reqd": 1
  },
  {
   "fieldname": "route_doctype",
   "fieldtype": "Link",
   "label": "Route Doctype",
   "options": "DocType",
   "reqd": 1
  },
  {
   "fieldname": "filter_json",
   "fieldtype": "Code",
   "label": "Filter Criteria"
  },
  {
   "fieldname": "field_title",
   "fieldtype": "Data",
   "label": "Title Field",
   "reqd": 1
  },
  {
   "fieldname": "field_description",
   "fieldtype": "Data",
   "label": "Description Field"
  },
  {
   "fieldname": "field_date",
   "fieldtype": "Data",
   "label": "Date Fields"
  },
  {
   "fieldname": "field_badge",
   "fieldtype": "Data",
   "label": "Badge Field"
  },
  {
   "default": "0",
   "fieldname": "is_public",
   "fieldtype": "Check",
   "label": "Is Public"
  },
  {
   "fieldname": "roles",
   "fieldtype": "Table",
   "label": "Allowed Roles",
   "options": "Sidebar Allowed Role"
  },
  {
   "fieldname": "users",
   "fieldtype": "Table",
   "label": "Allowed Users",
   "options": "Sidebar Allowed User"
  }
 ],
 "grid_page_length": 50,
 "index_web_pages_for_search": 1,
 "links": [],
 "modified": "2025-11-25 10:39:24.702541",
 "modified_by": "Administrator",
 "module": "Communicator",
 "name": "Focus Sidebar Tab",
 "owner": "Administrator",
 "permissions": [
  {
   "create": 1,
   "delete": 1,
   "email": 1,
   "export": 1,
   "print": 1,
   "read": 1,
   "report": 1,
   "role": "System Manager",
   "share": 1,
   "write": 1
  }
 ],
 "row_format": "Dynamic",
 "sort_field": "creation",
 "sort_order": "DESC",
 "states": []
}

```

### File: ./communicator/doctype/focus_sidebar_tab/focus_sidebar_tab.py
```
# Copyright (c) 2025, Jibreel  and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class FocusSidebarTab(Document):
	pass

```

### File: ./communicator/doctype/focus_sidebar_tab/test_focus_sidebar_tab.py
```
# Copyright (c) 2025, Jibreel  and Contributors
# See license.txt

# import frappe
from frappe.tests import IntegrationTestCase


# On IntegrationTestCase, the doctype test records and all
# link-field test record dependencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]



class IntegrationTestFocusSidebarTab(IntegrationTestCase):
	"""
	Integration tests for FocusSidebarTab.
	Use this class for testing interactions between multiple components.
	"""

	pass

```

### File: ./communicator/doctype/sidebar_allowed_role/sidebar_allowed_role.json
```
{
 "actions": [],
 "allow_rename": 1,
 "creation": "2025-11-25 10:13:59.648060",
 "doctype": "DocType",
 "editable_grid": 1,
 "engine": "InnoDB",
 "field_order": [
  "role"
 ],
 "fields": [
  {
   "fieldname": "role",
   "fieldtype": "Link",
   "label": "Role",
   "options": "Role"
  }
 ],
 "grid_page_length": 50,
 "index_web_pages_for_search": 1,
 "istable": 1,
 "links": [],
 "modified": "2025-11-25 10:14:30.329043",
 "modified_by": "Administrator",
 "module": "Communicator",
 "name": "Sidebar Allowed Role",
 "owner": "Administrator",
 "permissions": [],
 "row_format": "Dynamic",
 "sort_field": "creation",
 "sort_order": "DESC",
 "states": []
}

```

### File: ./communicator/doctype/sidebar_allowed_role/sidebar_allowed_role.py
```
# Copyright (c) 2025, Jibreel  and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SidebarAllowedRole(Document):
	pass

```

### File: ./communicator/doctype/sidebar_allowed_user/sidebar_allowed_user.json
```
{
 "actions": [],
 "allow_rename": 1,
 "creation": "2025-11-25 10:14:52.981883",
 "doctype": "DocType",
 "editable_grid": 1,
 "engine": "InnoDB",
 "field_order": [
  "user"
 ],
 "fields": [
  {
   "fieldname": "user",
   "fieldtype": "Link",
   "label": "User",
   "options": "User"
  }
 ],
 "grid_page_length": 50,
 "index_web_pages_for_search": 1,
 "istable": 1,
 "links": [],
 "modified": "2025-11-25 10:15:17.317792",
 "modified_by": "Administrator",
 "module": "Communicator",
 "name": "Sidebar Allowed User",
 "owner": "Administrator",
 "permissions": [],
 "row_format": "Dynamic",
 "sort_field": "creation",
 "sort_order": "DESC",
 "states": []
}

```

### File: ./communicator/doctype/sidebar_allowed_user/sidebar_allowed_user.py
```
# Copyright (c) 2025, Jibreel  and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SidebarAllowedUser(Document):
	pass

```

### File: ./document_project.sh
```
#!/bin/bash

# Output file name
OUTPUT="project_documentation.md"
# Directory to scan (current directory by default)
TARGET_DIR="${1:-.}"

# Clear or create the output file
echo "# Project Documentation" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Generated on: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Directory Structure" >> "$OUTPUT"
echo '```' >> "$OUTPUT"
# Try to use tree if installed, otherwise use find
if command -v tree &> /dev/null; then
    tree -I 'node_modules|.git|__pycache__' "$TARGET_DIR" >> "$OUTPUT"
else
    find "$TARGET_DIR" -maxdepth 3 -not -path '*/.*' >> "$OUTPUT"
fi
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## File Contents" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Find all files, exclude hidden files and specific directories
find "$TARGET_DIR" -type f -not -path '*/.*' -not -path '*/node_modules/*' -not -path '*/__pycache__/*' | sort | while read -r file; do
    # Check if the file is a text file (not binary)
    if grep -Iq . "$file"; then
        echo "### File: $file" >> "$OUTPUT"
        echo '```' >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
        echo "" >> "$OUTPUT"
        echo '```' >> "$OUTPUT"
        echo "" >> "$OUTPUT"
        echo "Processing: $file"
    else
        echo "Skipping binary file: $file"
    fi
done

echo "Done! Documentation saved to $OUTPUT"

```

### File: ./hooks.py
```
app_name = "communicator"
app_title = "Communicator"
app_publisher = "Jibreel "
app_description = "user interface for communication, todo and tasks"
app_email = "j_abdeen@yahoo.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "communicator",
# 		"logo": "/assets/communicator/logo.png",
# 		"title": "Communicator",
# 		"route": "/communicator",
# 		"has_permission": "communicator.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/communicator/css/communicator.css"
# app_include_js = "/assets/communicator/js/communicator.js"

# include js, css files in header of web template
# web_include_css = "/assets/communicator/css/communicator.css"
# web_include_js = "/assets/communicator/js/communicator.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "communicator/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "communicator/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "communicator.utils.jinja_methods",
# 	"filters": "communicator.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "communicator.install.before_install"
# after_install = "communicator.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "communicator.uninstall.before_uninstall"
# after_uninstall = "communicator.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "communicator.utils.before_app_install"
# after_app_install = "communicator.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "communicator.utils.before_app_uninstall"
# after_app_uninstall = "communicator.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "communicator.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"communicator.tasks.all"
# 	],
# 	"daily": [
# 		"communicator.tasks.daily"
# 	],
# 	"hourly": [
# 		"communicator.tasks.hourly"
# 	],
# 	"weekly": [
# 		"communicator.tasks.weekly"
# 	],
# 	"monthly": [
# 		"communicator.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "communicator.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "communicator.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "communicator.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "communicator.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["communicator.utils.before_request"]
# after_request = ["communicator.utils.after_request"]

# Job Events
# ----------
# before_job = ["communicator.utils.before_job"]
# after_job = ["communicator.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"communicator.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# app_include_js = "/assets/communicator/js/secondsidebar.js"

# doc_events = {
#     "Communication": {
#         "after_insert": "communicator.api.secondapi.notify_user_sidebar" # Change path to where you put the python code
#     },
#     "Task": {
#         "on_update": "communicator.api.secondapi.notify_user_sidebar"
#     },
#     "ToDo": {
#         "on_update": "communicator.api.secondapi.notify_user_sidebar"
#     }
# }

app_include_js = "/assets/communicator/js/focus_sidebar.js"
```

### File: ./__init__.py
```
__version__ = "0.0.1"

```

### File: ./modules.txt
```
Communicator
```

### File: ./patches.txt
```
[pre_model_sync]
# Patches added in this section will be executed before doctypes are migrated
# Read docs to understand patches: https://frappeframework.com/docs/v14/user/en/database-migrations

[post_model_sync]
# Patches added in this section will be executed after doctypes are migrated
```

### File: ./project_documentation.md
```

```

### File: ./public/js/focus_sidebar.js
```
$(document).ready(function() {
    if (typeof frappe === "undefined") return;

    if (frappe.session) {
        init_sidebar();
    } else {
        $(document).on('app_ready', function() {
            init_sidebar();
        });
    }
});

let focusSidebarState = {
    activeTab: null,
    mode: 0, // 0: Hidden, 1: Tabs Only, 2: Fully Open
    timer: null,
    tabs: [] 
};

// 1. INITIALIZE
function init_sidebar() {
    if (!frappe.session || frappe.session.user === 'Guest') return;

    $('#focus-sidebar, #focus-sidebar-css, #fs-trigger-btn').remove();
    inject_focus_css();

    frappe.call({
        method: "communicator.api.firstapi.get_sidebar_config",
        callback: function(r) {
            let data = r.message || [];
            let tabs = Array.isArray(data) ? data : (data.tabs || []);

            if(tabs && tabs.length > 0) {
                focusSidebarState.tabs = tabs;
                render_sidebar_shell(tabs);
                
                // Start in Tabs Only mode (1)
                setSidebarMode(1); 
                setup_realtime_listeners();
            }
        }
    });
}

// 2. RENDER SHELL (3-Step Logic UI)
function render_sidebar_shell(tabs) {
    let tabsHtml = tabs.map(tab => `
        <div class="fs-tab-item ${tab.color}" id="tab-${tab.id}" 
             onclick="loadFocusTab('${tab.id}')" 
             oncontextmenu="hideTabContext(event, '${tab.id}', '${tab.label}'); return false;"
             title="${tab.label}">
            <i class="${tab.icon}"></i>
            <div class="fs-notify-dot"></div>
        </div>
    `).join('');

    let html = `
        <!-- EXTERNAL TRIGGER (Left Arrow) -->
        <div id="fs-trigger-btn" onclick="setSidebarMode(1)" title="Show Sidebar">
            <i class="fa fa-chevron-left"></i>
        </div>

        <div id="focus-sidebar">
            <div class="fs-tabs">
                ${tabsHtml}
                
                <!-- Reset Preference Button -->
                <div class="fs-tab-item" onclick="resetTabPreferences()" title="Restore Hidden Tabs" style="margin-top:auto; height:30px;">
                    <i class="fa fa-eye" style="font-size:14px;"></i>
                </div>

                <!-- Collapse Button -->
                <div class="fs-collapse-btn" onclick="handleCollapseClick()" title="Minimize / Hide">
                    <i id="fs-collapse-icon" class="fa fa-chevron-right"></i>
                </div>
            </div>

            <div class="fs-content">
                <div class="fs-header">
                    <span id="fs-header-title">Select Tab</span>
                    <i class="fa fa-circle fs-socket-icon" title="Connected"></i>
                </div>
                <div class="fs-list-container" id="fs-list-area"></div>
            </div>
        </div>
    `;
    $('body').append(html);
}

// 3. LOGIC (3-STEP MODES)
window.handleCollapseClick = function() {
    if (focusSidebarState.mode === 2) {
        // Open -> Tabs Only
        setSidebarMode(1);
    } else if (focusSidebarState.mode === 1) {
        // Tabs Only -> Hidden
        setSidebarMode(0);
    }
};

window.setSidebarMode = function(mode) {
    focusSidebarState.mode = mode;
    const sidebar = $('#focus-sidebar');
    const trigger = $('#fs-trigger-btn');
    const icon = $('#fs-collapse-icon');

    sidebar.removeClass('mode-0 mode-1 mode-2');
    
    if (mode === 0) {
        // HIDDEN
        sidebar.addClass('mode-0');
        trigger.addClass('visible'); 
    } 
    else if (mode === 1) {
        // TABS ONLY
        sidebar.addClass('mode-1');
        trigger.removeClass('visible');
        icon.attr('class', 'fa fa-chevron-right'); // Icon points right to hide
    } 
    else if (mode === 2) {
        // OPEN
        sidebar.addClass('mode-2');
        trigger.removeClass('visible');
        icon.attr('class', 'fa fa-chevron-right'); // Icon points right to collapse
    }
};

window.loadFocusTab = function(tabId) {
    if (focusSidebarState.mode !== 2) setSidebarMode(2);
    focusSidebarState.activeTab = tabId;
    
    $('.fs-tab-item').removeClass('active');
    $(`#tab-${tabId}`).addClass('active').removeClass('has-update'); 

    let currentTab = focusSidebarState.tabs.find(t => t.id === tabId);
    $('#fs-header-title').text(currentTab ? currentTab.label : 'Loading...');
    $('#fs-list-area').html(`<div class="text-center mt-5"><i class="fa fa-spinner fa-spin text-muted"></i></div>`);

    frappe.call({
        method: "communicator.api.firstapi.get_sidebar_data", 
        args: { tab_id: tabId },
        callback: function(r) {
            if (r.message && r.message.visible) {
                render_generic_list(r.message.data, currentTab.color);
            } else {
                $('#fs-list-area').html(`<div class="text-muted text-center mt-5 small">No data found.</div>`);
            }
        }
    });
};

// 4. RENDERER (Header above Card Design)
function render_generic_list(data, colorClass) {
    const container = $('#fs-list-area');
    container.empty();
    
    if (!data || data.length === 0) {
        container.html(`<div class="text-muted text-center mt-5 small">No records found.</div>`);
        return;
    }

    const tabColors = { 'blue': '#2490ef', 'red': '#e74c3c', 'green': '#27ae60', 'orange': '#e67e22', 'purple': '#8e44ad' };
    const titleColor = tabColors[colorClass] || '#333';

    let html = data.map(item => {
        let badgeHtml = '<span></span>'; 
        if (item.badge) {
            let color = get_status_color(item.badge);
            badgeHtml = `<span class="fs-pill ${color}">${item.badge}</span>`;
        }

        let dateStr = '';
        if (item.date) {
            dateStr = frappe.datetime.prettyDate(item.date);
            if (!dateStr) dateStr = frappe.datetime.str_to_user(item.date);
        }

        return `
            <div class="fs-item-wrapper" onclick="frappe.set_route('Form', '${item.route_doctype}', '${item.name}')">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 4px 4px 4px;">
                    <div>${badgeHtml}</div>
                    <div style="font-size: 10px; color: var(--text-muted); font-weight: 500;">
                        ${dateStr}
                    </div>
                </div>

                <div class="fs-inner-card">
                    <div class="fs-card-title" style="color: ${titleColor};">
                        ${item.title}
                    </div>
                    <div style="font-size:12px; margin-top:4px; line-height:1.4; color:var(--text-color);">
                        ${item.description ? item.description.substring(0, 80) : ''}
                    </div>
                </div>
            </div>`;
    }).join('');
    
    container.html(html);
}

// 5. UTILS & ACTIONS
function get_status_color(status) {
    if(!status) return 'gray';
    let key = status.toLowerCase();
    const map = {
        'open': 'red', 'overdue': 'red', 'cancelled': 'red', 'rejected': 'red', 'error': 'red',
        'closed': 'green', 'completed': 'green', 'paid': 'green', 'success': 'green',
        'pending': 'orange', 'waiting': 'orange', 'hold': 'orange', 'to deliver and bill': 'orange',
        'submitted': 'blue', 'draft': 'blue', 
        'negotiating': 'purple'
    };
    return map[key] || 'gray';
}

window.hideTabContext = function(e, tabId, label) {
    e.preventDefault();
    frappe.confirm(`Hide <b>${label}</b>?`, () => {
        frappe.call({
            method: "communicator.api.firstapi.toggle_user_preference",
            args: { tab_id: tabId, hide: true },
            callback: () => { init_sidebar(); }
        });
    });
};

window.resetTabPreferences = function() {
    frappe.confirm('Show all hidden tabs?', () => {
        // FIXED CALL: Calling custom API instead of client.set_user_default
        frappe.call({
            method: "communicator.api.firstapi.reset_user_preferences",
            callback: () => { 
                init_sidebar(); 
                frappe.show_alert({message: "Tabs Restored", indicator: "green"});
            }
        });
    });
};

function setup_realtime_listeners() {
    frappe.realtime.on('doc_update', function(data) {
        focusSidebarState.tabs.forEach(tab => {
            if (tab.source_doctype === data.doctype) {
                $(`#tab-${tab.id}`).addClass('has-update');
                if (focusSidebarState.mode === 2 && focusSidebarState.activeTab === tab.id) {
                    clearTimeout(focusSidebarState.timer);
                    focusSidebarState.timer = setTimeout(() => loadFocusTab(tab.id), 1500);
                }
            }
        });
    });
}

// 6. CSS (3-Step Support + Card Design)
function inject_focus_css() {
    const css = `
        :root { --fs-width: 350px; --fs-tab-width: 60px; --fs-content-width: 290px; --fs-top-offset: 70px; }
        
        /* TRIGGER */
        #fs-trigger-btn {
            position: fixed; top: calc(100vh - 100px); right: -50px; 
            width: 36px; height: 36px; background: #fff;
            border: 1px solid var(--border-color); border-right: 0;
            border-radius: 8px 0 0 8px; z-index: 1000;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: -2px 2px 5px rgba(0,0,0,0.05);
            transition: right 0.3s;
        }
        #fs-trigger-btn.visible { right: 0; }
        #fs-trigger-btn:hover { background: var(--bg-light-gray); }

        /* CONTAINER */
        #focus-sidebar { 
            position: fixed; top: var(--fs-top-offset); 
            width: var(--fs-width); height: calc(100vh - 90px); 
            background: var(--card-bg); z-index: 1001; 
            box-shadow: -5px 5px 15px rgba(0,0,0,0.08); 
            border: 1px solid var(--border-color); border-right: 0; 
            border-radius: 12px 0 0 12px; display: flex; 
            transition: right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); 
        }

        /* 3 MODES */
        #focus-sidebar.mode-0 { right: calc(var(--fs-width) * -1) !important; }
        #focus-sidebar.mode-1 { right: calc(var(--fs-content-width) * -1) !important; }
        #focus-sidebar.mode-2 { right: 0 !important; }
        
        /* TABS */
        .fs-tabs { width: var(--fs-tab-width); min-width: var(--fs-tab-width); background: var(--bg-light-gray); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; padding: 15px 0; height: 100%; border-radius: 12px 0 0 12px; }
        .fs-tab-item { width: 40px; height: 40px; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); font-size: 18px; transition: all 0.2s; position: relative; }
        .fs-tab-item:hover { background: var(--fg-hover-color); transform: scale(1.05); color: var(--text-color); }
        .fs-tab-item.active.blue { color: #2490ef; background: rgba(36, 144, 239, 0.1); }
        .fs-tab-item.active.red { color: #e74c3c; background: rgba(231, 76, 60, 0.1); }
        .fs-tab-item.active.green { color: #27ae60; background: rgba(39, 174, 96, 0.1); }
        .fs-tab-item.active.orange { color: #e67e22; background: rgba(230, 126, 34, 0.1); }
        .fs-tab-item.active.purple { color: #8e44ad; background: rgba(142, 68, 173, 0.1); }
        .fs-notify-dot { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; display: none; }
        .fs-tab-item.has-update .fs-notify-dot { display: block; }
        
        .fs-collapse-btn { margin-top: auto; width: 36px; height: 36px; border-radius: 50%; background: #fff; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); box-shadow: 0 2px 5px rgba(0,0,0,0.05); margin-bottom: 10px;}
        
        /* CONTENT */
        .fs-content { flex: 1; height: 100%; display: flex; flex-direction: column; background: var(--card-bg); overflow: hidden; opacity: 0; transition: opacity 0.2s ease-in; }
        #focus-sidebar.mode-2 .fs-content { opacity: 1; }
        #focus-sidebar:not(.mode-2) .fs-content { opacity: 0; pointer-events: none; }
        
        .fs-header { padding: 10px 15px; border-bottom: 1px solid var(--border-color); font-weight: 700; font-size: 13px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-light-gray); color: var(--text-color); }
        .fs-list-container { flex: 1; overflow-y: auto; padding: 10px; background: var(--bg-light-gray); }
        
        /* ITEM DESIGN */
        .fs-item-wrapper { margin-bottom: 12px; cursor: pointer; }
        .fs-inner-card { background: #fff; border-radius: 8px; padding: 12px; border: 1px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.1s, border-color 0.1s; }
        .fs-item-wrapper:hover .fs-inner-card { border-color: var(--border-color); transform: translateY(-2px); box-shadow: 0 3px 6px rgba(0,0,0,0.08); }
        .fs-card-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
        
        .fs-pill { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 12px 12px 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .fs-pill.red { background: #fcecec; color: #d9534f; }
        .fs-pill.green { background: #ebf8f1; color: #2ecc71; }
        .fs-pill.blue { background: #e8f5ff; color: #2490ef; }
        .fs-pill.orange { background: #fdf6ec; color: #ffa00a; }
        .fs-pill.purple { background: #efe8fa; color: #7b3abc; }
        .fs-pill.gray { background: #f4f5f6; color: #8d99a6; }
    `;
    $('<style id="focus-sidebar-css">').prop('type', 'text/css').html(css).appendTo('head');
}
```

### File: ./public/js/secondsidebar.js
```
$(document).ready(function() {
    // 1. Safety Check
    if (typeof frappe === "undefined") return;

    // 2. Initialize
    if (frappe.session) {
        init_sidebar();
    } else {
        $(document).on('app_ready', function() {
            init_sidebar();
        });
    }
});

// Global state
let focusSidebarState = {
    activeTab: null,
    isOpen: false,
    timer: null
};

function init_sidebar() {
    if (!frappe.session || frappe.session.user === 'Guest') return;

    // --- CLEANUP ---
    $('#focus-sidebar-css').remove();
    $('#focus-sidebar').remove(); 
    $('#fs-trigger').remove(); 

    // 1. Inject Styles
    inject_focus_css();

    // 2. Render Shell
    render_sidebar_shell();

    // 3. Listeners
    setup_realtime_listeners();
}

function inject_focus_css() {
    const css = `
        :root {
            --fs-width: 350px;
            --fs-tab-width: 60px;
            --fs-content-width: 290px;
            --fs-top-offset: 70px;
            --fs-blue: #2490ef;
            --fs-red: #e74c3c;
            --fs-green: #27ae60;
        }

        /* --- SIDEBAR CONTAINER --- */
        #focus-sidebar {
            position: fixed;
            top: var(--fs-top-offset) !important;
            /* DEFAULT: Hidden (Collapsed) - Only Tabs Visible */
            right: calc(var(--fs-content-width) * -1) !important; 
            width: var(--fs-width);
            height: calc(100vh - 90px) !important;
            background: var(--card-bg);
            z-index: 1001;
            box-shadow: -5px 5px 15px rgba(0,0,0,0.08);
            border: 1px solid var(--border-color);
            border-right: 0;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            display: flex;
            font-family: var(--font-stack);
            transition: right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* OPEN STATE */
        #focus-sidebar.open {
            right: 0 !important;
        }

        /* --- TABS STRIP --- */
        .fs-tabs {
            width: var(--fs-tab-width);
            min-width: var(--fs-tab-width);
            background: var(--bg-light-gray);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 15px;
            padding-bottom: 15px;
            height: 100%;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            z-index: 2;
        }

        .fs-tab-item {
            width: 40px;
            height: 40px;
            margin-bottom: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-muted);
            font-size: 18px;
            transition: all 0.2s;
            position: relative;
            background: rgba(0,0,0,0.02);
        }

        .fs-tab-item:hover { 
            background: var(--fg-hover-color); 
            transform: scale(1.05); 
            color: var(--text-color);
        }

        /* --- ACTIVE STATES --- */
        .fs-tab-item.active.blue { background: rgba(36, 144, 239, 0.1); color: var(--fs-blue); border: 1px solid var(--fs-blue); }
        .fs-tab-item.active.red { background: rgba(231, 76, 60, 0.1); color: var(--fs-red); border: 1px solid var(--fs-red); }
        .fs-tab-item.active.green { background: rgba(39, 174, 96, 0.1); color: var(--fs-green); border: 1px solid var(--fs-green); }

        /* --- NOTIFICATION BLINKING LOGIC --- */
        
        /* 1. The Red Dot */
        .fs-notify-dot {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 10px;
            height: 10px;
            background: var(--primary-color);
            border-radius: 50%;
            border: 2px solid var(--bg-light-gray);
            display: none; 
        }
        .fs-tab-item.has-update .fs-notify-dot { display: block; }

        /* 2. The Icon Blinking Animations */
        @keyframes blink-blue { 
            0%, 100% { color: var(--text-muted); transform: scale(1); } 
            50% { color: var(--fs-blue); transform: scale(1.2); } 
        }
        @keyframes blink-red { 
            0%, 100% { color: var(--text-muted); transform: scale(1); } 
            50% { color: var(--fs-red); transform: scale(1.2); } 
        }
        @keyframes blink-green { 
            0%, 100% { color: var(--text-muted); transform: scale(1); } 
            50% { color: var(--fs-green); transform: scale(1.2); } 
        }

        /* Apply animation only when has-update class is present */
        .fs-tab-item.blue.has-update i { animation: blink-blue 1s infinite ease-in-out; }
        .fs-tab-item.red.has-update i { animation: blink-red 1s infinite ease-in-out; }
        .fs-tab-item.green.has-update i { animation: blink-green 1s infinite ease-in-out; }


        /* --- COLLAPSE BUTTON --- */
        .fs-collapse-btn {
            margin-top: auto; 
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-muted);
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .fs-collapse-btn:hover { background: var(--fg-hover-color); color: var(--text-color); }

        /* --- CONTENT AREA --- */
        .fs-content {
            flex: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: var(--card-bg);
            overflow: hidden;
            border-top-right-radius: 0;
            opacity: 0;
            transition: opacity 0.2s ease-in;
        }

        #focus-sidebar.open .fs-content {
            opacity: 1;
        }

        .fs-header {
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
            font-weight: 700;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-light-gray);
            color: var(--text-color);
            white-space: nowrap;
        }

        .fs-list-container {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }

        /* --- CARDS --- */
        .fs-card {
            background: var(--control-bg);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            border: 1px solid transparent;
            cursor: pointer;
            transition: transform 0.1s;
        }
        .fs-card:hover {
            border-color: var(--border-color);
            transform: translateX(-3px);
            background: var(--fg-hover-color);
        }
        
        .fs-card-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; color: var(--text-color); }
        .fs-card-meta { font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 6px; }
        .fs-socket-icon { color: var(--green-500); font-size: 9px; animation: pulse 2s infinite; margin-right:6px;}
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
    `;
    
    $('<style id="focus-sidebar-css">').prop('type', 'text/css').html(css).appendTo('head');
}

function render_sidebar_shell() {
    if ($('#focus-sidebar').length > 0) return;

    let html = `
        <div id="focus-sidebar">
            <!-- Left Tabs Strip (Always Visible) -->
            <div class="fs-tabs">
                <!-- Inbox (Blue) -->
                <div class="fs-tab-item blue" id="tab-inbox" onclick="loadFocusTab('inbox')" title="Inbox">
                    <i class="fa fa-envelope"></i>
                    <div class="fs-notify-dot"></div>
                </div>
                
                <!-- Tasks (Red) -->
                <div class="fs-tab-item red" id="tab-tasks" onclick="loadFocusTab('tasks')" title="My Tasks">
                    <i class="fa fa-tasks"></i>
                    <div class="fs-notify-dot"></div>
                </div>

                <!-- Performance (Green) -->
                <div class="fs-tab-item green" id="tab-performance" onclick="loadFocusTab('performance')" title="Performance Messages">
                    <i class="fa fa-tachometer"></i>
                    <div class="fs-notify-dot"></div>
                </div>

                <!-- Collapse Button -->
                <div class="fs-collapse-btn" onclick="toggleFocusSidebar(false)" title="Collapse Sidebar">
                    <i class="fa fa-chevron-right"></i>
                </div>
            </div>

            <!-- Right Content Area -->
            <div class="fs-content">
                <div class="fs-header">
                    <span id="fs-header-title">Select Tab</span>
                    <i class="fa fa-circle fs-socket-icon" title="Realtime Connection Active"></i>
                </div>
                <div class="fs-list-container" id="fs-list-area">
                    <div class="text-muted text-center mt-5 small">
                        Select a tab to view items.
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(html);
}

// --- LOGIC ---

window.toggleFocusSidebar = function(open) {
    focusSidebarState.isOpen = open;
    if (open) {
        $('#focus-sidebar').addClass('open');
        // If opening without a specific tab selected, default to inbox
        if (!focusSidebarState.activeTab) loadFocusTab('inbox');
    } else {
        $('#focus-sidebar').removeClass('open');
    }
};

window.loadFocusTab = function(tabType) {
    // 1. Force Open Sidebar (Decollapse) logic
    if (!focusSidebarState.isOpen) {
        toggleFocusSidebar(true);
    }

    focusSidebarState.activeTab = tabType;
    
    // 2. UI Updates
    $('.fs-tab-item').removeClass('active');
    
    // Set active tab and REMOVE notification/blinking
    $(`#tab-${tabType}`).addClass('active').removeClass('has-update'); 

    const titles = {
        'inbox': 'Email Inbox',
        'tasks': 'My Tasks',
        'performance': 'Performance'
    };
    $('#fs-header-title').text(titles[tabType]);

    // 3. Loader
    $('#fs-list-area').html(`
        <div class="text-center mt-5">
            <i class="fa fa-spinner fa-spin text-muted"></i>
        </div>
    `);

    // 4. API Call
    frappe.call({
        method: "communicator.api.secondapi.get_sidebar_data", 
        args: { tab_type: tabType },
        callback: function(r) {
            if (r.message && r.message.visible) {
                render_list_items(r.message.data, tabType);
            } else {
                $('#fs-list-area').html(`
                    <div class="text-muted text-center mt-5 small">
                        No data found.
                    </div>
                `);
            }
        },
        error: function(r) {
            console.error(r);
            $('#fs-list-area').html(`<div class="text-danger text-center mt-5 small">Error</div>`);
        }
    });
};

function render_list_items(data, type) {
    const container = $('#fs-list-area');
    container.empty();

    if (!data || data.length === 0) {
        container.html(`<div class="text-muted text-center mt-5 small">No records found.</div>`);
        return;
    }

    let html = data.map(item => {
        if (type === 'inbox') {
            return `
                <div class="fs-card" onclick="frappe.set_route('Form', '${item.reference_doctype || 'Communication'}', '${item.reference_name || item.name}')">
                    <div class="fs-card-title" style="color:var(--fs-blue)">${item.sender || 'Unknown'}</div>
                    <div style="font-size:12px; margin-bottom:5px; line-height:1.4;">${item.subject ? item.subject.substring(0, 45) + '...' : 'No Subject'}</div>
                    <div class="fs-card-meta"><span><i class="fa fa-paperclip"></i> Email</span><span>${frappe.datetime.comment_when(item.creation)}</span></div>
                </div>`;
        } 
        else if (type === 'tasks') {
            return `
                <div class="fs-card" onclick="frappe.set_route('Form', 'Task', '${item.name}')">
                    <div class="fs-card-title" style="color:var(--fs-red)">${item.subject}</div>
                    <div class="fs-card-meta"><span class="badge" style="zoom:0.8">${item.priority || 'Normal'}</span><span>${item.exp_end_date ? frappe.datetime.str_to_user(item.exp_end_date) : 'No Date'}</span></div>
                </div>`;
        } 
        else if (type === 'performance') {
            return `
                <div class="fs-card" onclick="frappe.set_route('Form', 'ToDo', '${item.name}')">
                    <div class="fs-card-title" style="color:var(--fs-green)"><i class="fa fa-exclamation-circle mr-1"></i> Msg</div>
                    <div style="font-size:12px; margin-bottom:5px; line-height:1.4;">${item.description ? item.description.substring(0, 60) + '...' : 'No details'}</div>
                    <div class="fs-card-meta"><span>${item.priority || 'Medium'}</span><span>${frappe.datetime.comment_when(item.date)}</span></div>
                </div>`;
        }
    }).join('');

    container.html(html);
}

// --- REALTIME ---
// --- REALTIME ---
function setup_realtime_listeners() {
    // 1. Listen for our Custom Python Event
    frappe.realtime.on('focus_sidebar_refresh', function(data) {
        console.log("Focus Sidebar: Update received for", data.doctype);

        if (data.doctype === 'Communication') {
            trigger_tab_update('inbox');
        } 
        else if (data.doctype === 'Task') {
            trigger_tab_update('tasks');
        } 
        else if (data.doctype === 'ToDo') {
            trigger_tab_update('performance');
        }
    });

    // 2. Keep standard listener as fallback (optional, but good for self-updates)
    frappe.realtime.on('doc_update', function(data) {
        // If I update a task myself, I want to see the change immediately
        if (data.modified_by === frappe.session.user) {
             if (data.doctype === 'Task') trigger_tab_update('tasks');
             if (data.doctype === 'ToDo') trigger_tab_update('performance');
        }
    });
}

function trigger_tab_update(tabName) {
    // 1. Mark the visible tab as updated (Triggering CSS Animation)
    $(`#tab-${tabName}`).addClass('has-update');

    // 2. If user is currently looking at this tab, auto-refresh the data
    if (focusSidebarState.isOpen && focusSidebarState.activeTab === tabName) {
        clearTimeout(focusSidebarState.timer);
        focusSidebarState.timer = setTimeout(() => {
            loadFocusTab(tabName);
            frappe.show_alert({message: `New ${tabName} data`, indicator: 'green'});
        }, 1000);
    }
}
```


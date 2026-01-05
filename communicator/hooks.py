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
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
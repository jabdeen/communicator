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
var log = console.log;

var settings = {
        date_format : 'DD-MM-YYYY',
        time_format : 'HH:mm',
    },
    preferences = {
        window_height : '60%',
        window_width : '60%',
        window_left : '20%',
        window_top : '20%'
    },
    tasks = [],
    notifications = [],
    apps = [
        {
            name : 'System Info',
            package : 'hz.sysinfo',
            icon : 'img/icons/info.svg'
        },
        {
            name : 'Environment',
            package : 'hz.env',
            icon : 'img/icons/computer.svg'
        },
        {
            name : 'File Explorer',
            package : 'hz.fm',
            icon : 'img/icons/folder2.svg'
        },
        {
            name : 'Settings',
            package : 'hz.settings',
            icon : 'img/icons/settings.svg'
        },
        {
            name : 'Browser',
            package : 'hz.browser',
            icon : 'img/icons/chrome.svg'
        },
        {
            name : 'Video Player',
            package : 'hz.video_player',
            icon : 'img/icons/video-player.svg'
        },
        {
            name : 'Calendar',
            package : 'hz.cal',
            icon : 'img/icons/calendar.svg'
        },
        {
            name : 'Camera',
            package : 'hz.cam',
            icon : 'img/icons/photo-camera.svg'
        },
        {
            name : 'Calculator',
            package : 'hz.cam',
            icon : 'img/icons/calculator.svg'
        },
    ],
    desktop = {
        shortcuts : [
            {
                name : 'Launch Camera',
                app : 'hz.cam',
            },
            {
                name : 'Internet',
                app : 'hz.browser',
            }
        ]
    },
    packages_dir = 'apps/',
    sys_url = window.location.origin + window.location.pathname
;


var launcher = $('.launcher'),
    launcher_trigger = $('.launcher_trigger');


$(document)
    .on('click', '.launcher_trigger', function(){
        $(this).parent().toggleClass('open');
    })
    .on('click', '.taskbar_try > div', function(){
        $(this).toggleClass('open')
    })
    .on('click', '[data-app]', function(){
        launchApp(this.dataset.app);
    })
    .on('click', '[data-shortcut]', function(){
        launchApp(this.dataset.shortcut);
    })
    .on('click', '.winc_close', function(){
        closeWindow($(this).closest('.window'));
    })
    .on('click', '.winc_max', function(){
        toggleWindowSize($(this).closest('.window'));
    })
    .on('click', '.notifications_dimiss', function(){
        $('.desktop_notif').find('i').trigger('click');
        handleNotificationsDismiss();
    })




    .ready(function(){
        tick();
        loadApps();
        refreshDesktop();
    })

    ;

function tick(){
    updateClock();



    setTimeout(tick, 1000);
}
function updateClock(){
    $('.tc_time').html(moment().format(settings.time_format));
    $('.tc_date').html(moment().format(settings.date_format));
}
function loadApps(){
    var lapps = $('.ld_apps').html(''),
        app_template = $('<div data-app><span></span><label></label></div>');

    $.each(apps, function(i, app){
        var _app = app_template.clone();
        _app
            .attr('data-app', app.package)
            .find('span').html('1').css('background-image', "url("+app.icon+")").end()
            .find('label').html(app.name).end()
            .appendTo(lapps);
    })
}

function refreshDesktop(){
    var container = $('.desktop_shortcuts');
    var short_app_template = $('<div data-shortcut class="ds_app"><span></span><label></label></div>');

    $.each(desktop.shortcuts, function(i, short){
        var sh = short_app_template.clone();

        sh
            .attr('data-shortcut', short.app)
            .find('span').css('background-image', 'url('+ getAppByPackage(short.app).icon +')').end()
            .find('label').html(short.name).end()
            .appendTo(container);
    })
}

function getAppByPackage(pckg){
    var ret = {icon : '', name : '', package : ''};
    $.each(apps, function(i, app){
        if (pckg === app.package){
            ret = app;
            return false;
        }
    });
    return ret;
}
function openContentWindow(data, app, pid) {
    var title = $(data).data('title' || app.name);

    openWindow(getWindowTemplate(pid)
        .attr('data-src-app', app.package)
        .find('img').attr('src', app.icon).attr('alt', app.name + ' icon').end()
        .find('.control label').html(title).end()
        .find('.win_inner').html(data).end());


}
function openWindow(_window){
    if(typeof _window === 'string') _window = $('[data-window="'+_window+'"]');
    _window
        .css({
            transform: 'scale(.4)',
            opacity : 0,
            left : preferences.window_left,
            top : preferences.window_top,
            width : preferences.window_width,
            height : preferences.window_height,
        })
        .appendTo('#desktop');
    tasks.push(_window);
    setTimeout(function(){
        _window.css({opacity : 1, transform: 'scale(1)' })
    })
}
function toggleWindowSize(win){
    if(typeof win === 'string') win = $('[data-window="'+win+'"]');
    if(win.data('max')){
        win.css({
            height : win.data('h'),
            width : win.data('w'),
            top : win.data('t'),
            left : win.data('l'),
        }).data('max', false)
    }else{
        win.data({
            h : win.height(),
            w : win.width(),
            t : win.css('top'),
            l : win.css('left'),
            max : true,
        })
            .css({
                height : '100%',
                width : '100%',
                top : 0,
                left : 0
            })
    }
}
function closeWindow(_window){
    if(typeof _window === 'string') _window = $('[data-window="'+_window+'"]');

    $.each(tasks, function(i, task){
        if(task.data('window') === _window.data('window'))
            tasks.splice(i, 1);
    });
    _window.css({opacity : 0, transform: 'scale(.2)' });
    setTimeout(function(){
        _window.remove();
    }, 400);
    markAppClosed(getAppByPackage(_window.attr('data-src-app')))
}
function getWindowTemplate(pid){
    var window = $('<div class="window" data-window>' +
        '<div class="control"><img src="" alt=""><label></label><span><i class="winc_min"></i><i class="winc_max"></i><i class="winc_close"></i></span></div><div class="win_inner"></div></div>');

    return window.clone().attr('data-window', (pid || random(5, 'PID_')));
}
function launchApp(pckg){
    var app = getAppByPackage(pckg);
    if(app.package === '') return false;

    var splash = $('<div class="splash_screen"><span></span><label></label></div>');
    var PID = random(5, 'PID_');

    splash
        .find('span').css('background-image', 'url('+ app.icon +')').end()
        .find('label').html('Launching ' + app.name + ' ...').end()
        .appendTo('#desktop');
    setTimeout(function(){splash.addClass('shown')}, 2);
    cleanDrops();

    markAppRunning(app);
    tasks.push(splash);


    $
        .get(sys_url + packages_dir + app.package.split('.').join('/') + '.html#' + PID, function(data){
            openContentWindow(data, app, PID);
        })
        .always(function(){
            splash.fadeOut('fast', function(){
                splash.remove();
            });
        })
        .fail(function(){
            notify(app, 'Cannot run this app. 404');
            markAppClosed(app);
        })



}
function markAppRunning(app){
    log('marking ' + app.package);
    $('[data-app="'+ app.package +'"], [data-shortcut="'+ app.package +'"]').addClass('running');
}
function markAppClosed(app){
    $('[data-app="'+ app.package +'"], [data-shortcut="'+ app.package +'"]').removeClass('running');
}
function cleanDrops(){
    $('.open').removeClass('open');
}
function rnd(min, max){
    return Math.floor(Math.random() * max) + min;
}
function random(length, prefix, suffix) {
    var str = 'ABCDEFGHIJKLMNOPKRSTUVWXYZ123456789abcdefghijklmnopkrstuvwxyz-';
    var ret = '';
    prefix = prefix || '';
    suffix = suffix || '';
    length = length || 5;
    while (ret.length < length){
        ret += str.charAt(rnd(0, str.length - 1));
    }
    return prefix + ret + suffix;
}

function notify(app, text, title, icon, action, timeOut){
    var notification = $('<div class="desktop_notif"><i>X</i><a href="#"><span></span><h3></h3><p></p></a></div>');

    notification
        .find('a').attr('href', action || '#').on('click', function(){
            $(this).parent().find('i').click();
        }).end()
        .find('span').css('background-image', 'url('+(icon || app.icon)+')').end()
        .find('h3').html(title || app.name).end()
        .find('p').html(text || '').end()
        .css('bottom', 60 + ($('.desktop_notif').length * 80))
        .find('i').on('click', function(){
            notification.css('bottom', -160).animate({
                opacity : 0
            }, 200, function(){
                $(this).remove();
            })
        }).end()
        .appendTo('#desktop');

    setTimeout(function(){
        notification.find('i').click();
        handleNotificationsDismiss();
    }, timeOut || 2000000);

    handleNotificationsDismiss();


    notifications.push({
        app : app.package,
        notification : notification
    });
}

function handleNotificationsDismiss(){
    var notifs = $('.desktop_notif'),
        dismiss = $('.notifications_dimiss');

    if(notifs.length > 2 && dismiss.length === 0){
        $('#desktop').append('<div class="notifications_dimiss"><i></i></div>')
    }else if(notifs.length < 2){
        dismiss.remove();
    }else{
        setTimeout(handleNotificationsDismiss, 200)
    }
}
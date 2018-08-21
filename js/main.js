var log = console.log;

var settings = {
        date_format : 'DD-MM-YYYY',
        time_format : 'HH:mm',
    }

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




    .ready(function(){
        tick();
    })

    ;

function tick(){
    $('.tc_time').html(moment().format(settings.time_format));
    $('.tc_date').html(moment().format(settings.date_format));



    setTimeout(tick, 1000);
}
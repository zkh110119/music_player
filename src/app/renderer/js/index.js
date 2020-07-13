window.$ = require('jquery'),
    window.jQuery = require('jquery'),
    window.Popper = require('popper.js');
require('bootstrap');
const {minimizeWindow, maximizeWindow, restoreWindow, closeWindow} = require('./base.js');
let player = null;

let bindButtonEventListener = () => {
    $('#window_minimize').on('click', () => {
        minimizeWindow();
    });
    $('#window_maximize').on('click', () => {
        $('#window_maximize').addClass('hidden');
        $('#window_restore').removeClass('hidden');
        maximizeWindow();
    });
    $('#window_restore').on('click', () => {
        $('#window_restore').addClass('hidden');
        $('#window_maximize').removeClass('hidden');
        restoreWindow();
    });
    $('#window_closed').on('click', () => {
        closeWindow();
    });
};

let initialize = () => {
    bindButtonEventListener();
    player = document.getElementById('music_player');
    $('#player').on('click', () => {
        if ($('#player').data('type') == 1) {
            playMusic();
        } else {
            pauseMusic();
        }
    });
    player.ontimeupdate = () => {
        updateProgressBar();
    };
};

$(function () {
    initialize();
});

function playMusic() {
    player.play();
    $('#player').data('type', 0).children('i').html('&#xe7a9;');

}


function pauseMusic() {
    player.pause();
    $('#player').data('type', 1).children('i').html('&#xe617;');
}


function updateProgressBar() {
    let duration = player.duration,
        currentTime = player.currentTime;
    console.log(duration, currentTime);
    let progress = Math.floor(currentTime / duration * 1000);
    $('#play-progress').children('.progress-bar.progress-bar-success').css('width', progress/10 + '%').attr('aria-valuenow', progress);
}

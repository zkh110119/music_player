window.$ = require('jquery'),
    window.jQuery = require('jquery'),
    window.Popper = require('popper.js');
require('bootstrap');
const {minimizeWindow, maximizeWindow, restoreWindow, closeWindow} = require('./base.js');
let timer = null;

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
    $('#player').on('click', () => {
        playMusic();
    });
};

let initialize = () => {
    bindButtonEventListener();
};

$(function () {
    initialize();
});

function playMusic() {
    let player = document.getElementById('music_player');
    console.log(player.duration);
}
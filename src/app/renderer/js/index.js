window.$ = require('jquery'),
    window.jQuery = require('jquery'),
    window.Popper = require('popper.js');
require('bootstrap');
const {ipcRenderer} = require('electron');
const {minimizeWindow, maximizeWindow, restoreWindow, closeWindow} = require('./base.js');
const path = require('path');
let audio = null;
const baseUrl = path.resolve('./Cache');
/*const {v4} = require('uuid');
console.log(v4());*/
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
        if ($(audio).data('id') && audio.currentTime) {
            localStorage.setItem('iLike', JSON.stringify({id: $(audio).data('id'), currTime: audio.currentTime}));
        }
        closeWindow();
    });
};

let initialize = () => {
    audio = new Audio();
    audio.controls = 'controls';
    let lastPlayMusic = JSON.parse(localStorage.getItem('iLike'));
    if (lastPlayMusic) {
        let data = ipcRenderer.sendSync('getPlayMenus', {id: lastPlayMusic.id});
        if (data.code == 200) {
            if (data.rows.length > 0) {
                audio.src = path.join(baseUrl, data.rows[0].src);
                audio.currentTime = lastPlayMusic.currTime;
                $(audio).data('id', lastPlayMusic.id);
            } else {
                console.log('未找到该歌曲！');
            }
        } else {
            console.error(data.message);
        }
    } else {
        let data = ipcRenderer.sendSync('getPlayMenus');
        if (data.code == 200) {
            if (data.rows.length > 0) {
                audio.src = path.join(baseUrl, data.rows[0].src);
                audio.currentTime = 0;
                $(audio).data('id', data.rows[0].id);
            } else {
                console.log('未找到该歌曲！');
            }
        } else {
            console.log(data.message);
        }
    }
    audio.ontimeupdate = () => {
        updateProgressBar();
    };
    audio.onended = () => {
        endToPlayNext();
    };
    updateProgressBar();
    bindButtonEventListener();
    $('#player').on('click', () => {
        if ($('#player').data('type') == 1) {
            startPlay();
        } else {
            pauseMusic();
        }
    });
    $('#next').on('click', () => {
        nextMusic();
    });
    $('#pre').on('click', () => {
        preMusic();
    });
};

$(function () {
    initialize();
});

function playMusic() {
    audio.onloadstart = () => {
        console.log('开始加载歌曲！')
    };
    audio.onprogress = () => {
        console.log('歌曲加载中...')
    };
    audio.oncanplay = () => {
        audio.play();
        $('#player').data('type', 0).children('i').html('&#xe7a9;');
    }

}

function startPlay() {
    audio.play();
    $('#player').data('type', 0).children('i').html('&#xe7a9;');
}

function pauseMusic() {
    audio.pause();
    $('#player').data('type', 1).children('i').html('&#xe617;');
}


function updateProgressBar() {
    let duration = audio.duration,
        currentTime = audio.currentTime;
    let progress = Math.floor(currentTime / duration * 1000);
    $('#play-progress').children('.progress-bar.progress-bar-success').css('width', progress / 10 + '%').attr('aria-valuenow', progress);
}

function nextMusic() {
    let data = ipcRenderer.sendSync('getNextIdById', {id: $(audio).data('id')});
    playMusicEvent(data);
}


function preMusic() {
    let data = ipcRenderer.sendSync('getPreIdById', {id: $(audio).data('id')});
    playMusicEvent(data);
}


function playMusicEvent(data) {
    if (data.code == 200) {
        if (data.rows.length > 0) {
            audio.src = path.join(baseUrl, data.rows[0].src);
            audio.currentTime = 0;
            audio.load();
            $(audio).data('id', data.rows[0].id);
            playMusic();
        } else {
            console.log('未找到该歌曲！');
        }
    } else {
        console.log(data.message);
    }
}

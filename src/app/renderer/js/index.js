window.$ = require('jquery'),
    window.jQuery = require('jquery'),
    window.Popper = require('popper.js');
require('bootstrap');
require('bootstrap-table');
const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;

const {minimizeWindow, maximizeWindow, restoreWindow, closeWindow} = require('./base.js');
const path = require('path');
const fs = require('fs');
let audio = null;
const baseUrl = path.resolve('./cache');
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
    ipcRenderer.on('renderer-download-finish', (event, data) => {
        dialog.showMessageBox({
            type: 'info',
            title: '提示信息',
            message: data.message
        });
    });
};

let initialize = () => {
    audio = new Audio();
    audio.controls = 'controls';
    let lastPlayMusic = JSON.parse(localStorage.getItem('iLike'));
    if (lastPlayMusic) {
        let data = ipcRenderer.sendSync('getPlayMenus', {id: lastPlayMusic.id});
        enterMusicPanel(data, lastPlayMusic.currTime);
    } else {
        let data = ipcRenderer.sendSync('getPlayMenus');
        enterMusicPanel(data, 0);
    }
    audio.ontimeupdate = () => {
        updateProgressBar();
    };
    audio.onended = () => {
        endToPlayNext();
    };
    updateProgressBar();
    bindButtonEventListener();
    $('#downloadMusic').on('click', () => {
        downloadMusic(true);
    });
    $('#loop').on('click', (e) => {
        if (audio && audio.loop != undefined) {
            if (audio.loop == '') {
                audio.loop = 'loop';
                $(e.target).html('&#xe66d;');
            } else {
                audio.loop = '';
                $(e.target).html('&#xe66c;');
            }
        } else {
            audio.loop = '';
            $(e.target).html('&#xe66c;');
        }
    });
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
    initPlayMenus();
    $(window).on('resize', () => {
        $('#table').bootstrapTable('resetView', {
            height: $('.music-body').height()
        });
    });
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

function preMusic() {
    let data = ipcRenderer.sendSync('getPreIdById', {id: $(audio).data('id')});
    playMusicEvent(data);
}

function nextMusic() {
    let data = ipcRenderer.sendSync('getNextIdById', {id: $(audio).data('id')});
    playMusicEvent(data);
}

function downloadMusic(b) {
    ipcRenderer.send('downloadMusic', {id: $('#downloadMusic').data('curr'), rtn: b ? true : false});
}

function endToPlayNext() {
    nextMusic();
}

function setVioceSize() {

}

function enterMusicPanel(data, currTime) {
    if (data.code == 200) {
        if (data.rows.length > 0) {
            $('#downloadMusic').data('curr', data.rows[0].id);
            if (/http/.test(data.rows[0].src)) {
                audio.src = data.rows[0].src;
            } else {
                let srcStr = path.join('file://', baseUrl, data.rows[0].src);
                if (fs.existsSync(srcStr)) {
                    audio.src = srcStr;
                } else {
                    downloadMusic();
                    audio.src = data.rows[0].online_src;
                }
            }
            audio.currentTime = currTime;
            if (data.rows[0].img_src) {
                if (/http/.test(data.rows[0].img_src)) {
                    $('#show_image').attr('src', data.rows[0].img_src);
                } else {
                    let imgStr = path.join('file://', baseUrl, data.rows[0].img_src);
                    if (fs.existsSync(imgStr)) {
                        $('#show_image').attr('src', imgStr);
                    } else {
                        $('#show_image').attr('src', data.rows[0].online_img_src);
                    }
                }
            }
            if (data.rows[0].name) {
                $('#music_name').text(data.rows[0].name);
            } else {
                $('#music_name').text('未知');
            }
            if (data.rows[0].author) {
                $('#author_name').text(' - ' + data.rows[0].author);
            } else {
                $('#author_name').text(' - 未知');
            }
            $(audio).data('id', data.rows[0].id);
        } else {
            console.log('未找到该歌曲！');
        }
    } else {
        console.log(data.message);
    }
}

/**
 * 播放事件
 * @param {Object} data
 */
function playMusicEvent(data) {
    if (data.code == 200) {
        if (data.rows.length > 0) {
            $('#downloadMusic').data('curr', data.rows[0].id);
            if (/http/.test(data.rows[0].src)) {
                audio.src = data.rows[0].src;
            } else {
                let srcStr = path.join('file://', baseUrl, data.rows[0].src);
                if (fs.existsSync(srcStr)) {
                    audio.src = srcStr;
                } else {
                    downloadMusic();
                    audio.src = data.rows[0].online_src;
                }
            }
            audio.currentTime = 0;
            if (data.rows[0].img_src) {
                if (/http/.test(data.rows[0].img_src)) {
                    $('#show_image').attr('src', data.rows[0].img_src);
                } else {
                    let imgStr = path.join('file://', baseUrl, data.rows[0].img_src);
                    if (fs.existsSync(imgStr)) {
                        $('#show_image').attr('src', imgStr);
                    } else {
                        $('#show_image').attr('src', data.rows[0].online_img_src);
                    }
                }
            }
            if (data.rows[0].name) {
                $('#music_name').text(data.rows[0].name);
            } else {
                $('#music_name').text('未知');
            }
            if (data.rows[0].author) {
                $('#author_name').text(' - ' + data.rows[0].author);
            } else {
                $('#author_name').text(' - 未知');
            }
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

/**
 * 更新进度条和显示的时间
 */
function updateProgressBar() {
    let duration = Math.ceil(audio.duration),
        currentTime = Math.ceil(audio.currentTime);
    let progress = Math.ceil(currentTime / duration * 100);
    $('#play-progress').children('.progress-bar.progress-bar-success').css('width', progress + '%').attr('aria-valuenow', progress);
    $('#show_time').html(secondToStandardTime(currentTime) + ' / ' + secondToStandardTime(duration));
}

/**
 * 将秒数转换为时分秒的格式
 *
 * @param {string} time
 * @returns {string}
 */
function secondToStandardTime(time) {
    let hour = Math.floor(time / 3600);
    let minute = Math.floor((time - hour * 3600) / 60);
    let second = (time - hour * 3600) % 60;
    return `${hour == 0 ? '' : hour < 10 ? '0' + hour + ':' : hour + ':'}${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
}


function initPlayMenus() {
    $('#table').bootstrapTable({
        height: $('.music-body').height(),
        columns: [{
            field: 'name',
            title: '歌曲',
            formatter: (value, row) => {
                return `<i class="glyphicon glyphicon-heart" style="font-size: 15px;color: #ff4d71;"></i>
                        &nbsp;${value}
                       `;
            }
        }, {
            field: 'author',
            title: '歌手'
        }, {
            field: 'album',
            title: '专辑'
        }],
        ajax: (params) => {
            $.get('http://localhost:3000/getAllData').then((res) => {
                console.log(res);
                params.success(res.rows);
            });
        },
        rowStyle: {
            css: {
                padding: "16px 8px"
            }
        }
    });
}

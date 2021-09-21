
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {

    },
    setConfig: function (key, value) { 
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
    {
        name: 'Always Remember Us This Way',
        singer: 'Lady Gaga',
        path: './assets/music/AlwaysRememberUsThisWay-LadyGaga-5693911.mp3',
        image: './assets/img/1.jpg'
    },
    {
        name: 'Shallow',
        singer: 'Lady Gaga',
        path: './assets/music/Shallow-Lady-Gaga_ Bradley-Cooper.mp3',
        image: './assets/img/2.jpg'
    },
    {
        name: 'I Never Love Again',
        singer: 'Lady Gaga',
        path: './assets/music/ILlNeverLoveExtendedVersionRadioEdit-LadyGaga-5693922.mp3',
        image: './assets/img/3.jpg'
    },
    {
        name: 'Heal Me',
        singer: 'Lady Gaga',
        path: './assets/music/healme.mp3',
        image: './assets/img/4.jpg'
    },
    {
        name: 'Before I Cry',
        singer: 'Lady Gaga',
        path: './assets/music/BeforeICry-LadyGaga-5693918.mp3',
        image: './assets/img/5.png'
    },
    {
        name: 'Too Far Gone',
        singer: 'Bradley Cooper',
        path: './assets/music/toofar.mp3',
        image: './assets/img/6.jpg'
    }
    ],
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                <div class="thumb" 
                style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        $('.playlist').innerHTML = htmls.join(' ');
    },
    isPlaying: false,
    handleEvent: function(){
        const cdWidth = cd.offsetWidth
        const _this = this

        // Hoạt ảnh cd quay
        cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        // Phóng to thu nhỏ cd
        document.onscroll = function(){
            document.onscroll = function(){
                const scrollTop = window.scrollY || document.documentElement.scrollTop
                const newCdWidth = cdWidth - scrollTop

                cd.style.width = 
                    newCdWidth > 0 ? newCdWidth + 'px' : 0
                cd.style.opacity = newCdWidth / cdWidth
            }
        }
        // Xử lí khi play
        playBtn.onclick = function (){
            if (_this.isPlaying)
            {
                _this.isPlaying = false
                audio.pause()
                player.classList.remove('playing') 
            }
            else {
                audio.play()
            }
        }
        
        // Khi bài hát được chạy
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            
        }

        // Khi bài hát được tạm dừng
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing') 
            cdThumbAnimate.pause()
            
        }

        // Khi tiến dộ bài hát thay đổi
        audio.ontimeupdate = function (){
            if (audio.duration)
            {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Tua bài hát 
        progress.onchange = function(e){
            const seekTime = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
        }

        // Next, Prev bài hát
        nextBtn.onclick =  function(){
            _this.nextSong() 
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        prevBtn.onclick = function(){
            _this.prevSong()
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        
        // Nút random
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        
        // Tự động phát tiếp khi hết bài
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
                return
            }
            if (_this.isRandom) {
                _this.playRandomSong()
                return
            }
            nextBtn.click()
            audio.play()
        }
        
        // Xử lí lặp lại bài hát
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        
        // Xử lí khi click vào bài khát
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')
            if (songNode){
                const indexSong = Number(songNode.dataset.index)
                _this.currentIndex = indexSong
                _this.loadCurrentSong()
                _this.render()
                audio.play()
            }
        }
    },
    scrollToActiveSong: function(){
        let _this = this
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: `${_this.currentIndex < 3 ? 'end' : 'center'}`
            })
        }, 200) 
    },
    nextSong: function(){
        this.currentIndex ++
        if (this.currentIndex > this.songs.length - 1)
        {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex --
        if (this.currentIndex < 0)
        {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom || false
        this.isRepeat = this.config.isRepeat || false

    },
    start: function () {
        this.loadConfig()
        this.defineProperties()
        this.handleEvent()
        this.loadCurrentSong()
        this.render()  
        // Trạng thái các nút
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}
app.start()

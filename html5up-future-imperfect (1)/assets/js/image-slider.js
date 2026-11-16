/* ==========================================================
   IMAGE SLIDER - ALL-IN-ONE FILE (styles + script)
   File: assets/js/image-slider.js
   Link it ONCE per page, after main.js:
       <script src="assets/js/image-slider.js"></script>
   Then in any post use:
       <div class="slider" data-images="images/a.jpg, images/b.jpg"></div>
   Optional attributes: data-autoplay="4000"  data-alt="description"
   ========================================================== */
(function () {

  /* ---------- 1. STYLES (injected automatically into the page) ---------- */
  var css = `
    .slider{position:relative;display:block;width:100%;margin:0 0 3em 0;overflow:hidden}
    .slider-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;
      -webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}
    .slider-track::-webkit-scrollbar{display:none}
    .slider-slide{flex:0 0 100%;scroll-snap-align:center}
    .slider-slide img{display:block;width:100%;user-select:none;-webkit-user-drag:none}
    .slider-btn{position:absolute;top:50%;transform:translateY(-50%);width:2.4em;height:2.4em;padding:0;
      border:0;border-radius:100%;background:rgba(255,255,255,.85);color:#333;line-height:2.4em;
      text-align:center;cursor:pointer;opacity:0;transition:opacity .2s;z-index:2}
    .slider:hover .slider-btn{opacity:1}
    .slider-btn.prev{left:.75em} .slider-btn.next{right:.75em}
    .slider-btn[disabled]{display:none}
    @media (hover:none){.slider-btn{display:none}}
    .slider-counter{position:absolute;top:.75em;right:.75em;padding:.2em .7em;border-radius:2em;
      background:rgba(0,0,0,.6);color:#fff;font-size:.75em;z-index:2}
    .slider-dots{position:absolute;left:0;right:0;bottom:.8em;display:flex;justify-content:center;gap:.45em;z-index:2}
    .slider-dot{width:.55em;height:.55em;padding:0;border:0;border-radius:100%;
      background:rgba(255,255,255,.5);cursor:pointer;transition:background .2s,transform .2s}
    .slider-dot.active{background:#fff;transform:scale(1.25)}
    @media screen and (max-width:736px){
      .post > .slider{margin:calc(-1.5em - 1px) 0 1.5em -1.5em;width:calc(100% + 3em)}
    }`;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- 2. BUILD EVERY SLIDER ON THE PAGE ---------- */
  document.querySelectorAll('.slider[data-images]').forEach(function (slider) {

    // Read the image list from data-images="a.jpg, b.jpg, c.jpg"
    var images = slider.getAttribute('data-images').split(',')
      .map(function (s) { return s.trim(); }).filter(Boolean);
    var total = images.length;

    // Create the track and one slide per image
    var track = document.createElement('div');
    track.className = 'slider-track';
    images.forEach(function (src) {
      var slide = document.createElement('div');
      slide.className = 'slider-slide';
      slide.innerHTML = '<img src="' + src + '" alt="' + (slider.getAttribute('data-alt') || '') + '" />';
      track.appendChild(slide);
    });
    slider.appendChild(track);
    if (total < 2) return;                       // one image only: no controls needed

    // Arrows, counter, dots
    function btn(cls, label, html) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = cls; b.innerHTML = html;
      b.setAttribute('aria-label', label); return b;
    }
    var prev = btn('slider-btn prev', 'Previous image', '&#10094;');
    var next = btn('slider-btn next', 'Next image', '&#10095;');
    var counter = document.createElement('div'); counter.className = 'slider-counter';
    var dotsBox = document.createElement('div'); dotsBox.className = 'slider-dots';
    var dots = images.map(function (_, i) {
      var d = btn('slider-dot', 'Go to image ' + (i + 1), '');
      d.addEventListener('click', function () { goTo(i); });
      dotsBox.appendChild(d); return d;
    });
    slider.appendChild(prev); slider.appendChild(next);
    slider.appendChild(counter); slider.appendChild(dotsBox);

    // Helpers
    function current() { return Math.round(track.scrollLeft / track.clientWidth); }
    function goTo(i) {
      i = Math.max(0, Math.min(total - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    }
    function update() {
      var c = current();
      dots.forEach(function (d, i) { d.classList.toggle('active', i === c); });
      counter.textContent = (c + 1) + ' / ' + total;
      prev.disabled = (c === 0); next.disabled = (c === total - 1);
    }

    // Events
    prev.addEventListener('click', function () { goTo(current() - 1); });
    next.addEventListener('click', function () { goTo(current() + 1); });
    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    });
    window.addEventListener('resize', function () {
      track.scrollTo({ left: current() * track.clientWidth, behavior: 'auto' });
    });
    track.tabIndex = 0;                          // keyboard left/right arrows
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current() - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
    });

    // Mouse drag for desktop
    var down = false, startX = 0, startScroll = 0;
    track.addEventListener('mousedown', function (e) {
      down = true; startX = e.pageX; startScroll = track.scrollLeft;
      track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto';
    });
    window.addEventListener('mousemove', function (e) {
      if (down) track.scrollLeft = startScroll - (e.pageX - startX);
    });
    window.addEventListener('mouseup', function () {
      if (!down) return; down = false;
      var t = current();
      track.style.scrollSnapType = ''; track.style.scrollBehavior = '';
      goTo(t);
    });

    // Optional autoplay: data-autoplay="4000" (milliseconds)
    var delay = parseInt(slider.getAttribute('data-autoplay'), 10);
    if (delay > 0) {
      var timer = setInterval(function () { goTo(current() === total - 1 ? 0 : current() + 1); }, delay);
      ['mouseenter', 'touchstart'].forEach(function (ev) {
        slider.addEventListener(ev, function () { clearInterval(timer); });
      });
    }
    update();
  });
})();

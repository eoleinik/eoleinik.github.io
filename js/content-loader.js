fetch('content.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {

    // Sidebar + mobile header: show nickname
    document.querySelectorAll('.content-name').forEach(function(el) {
      el.textContent = data.nickname || data.name;
    });

    // About heading: full name + (aka nickname) in handwritten font
    var fullnameEl = document.querySelector('.content-fullname');
    if (fullnameEl) {
      fullnameEl.innerHTML = data.name +
        ' <span class="aka">(aka ' + (data.nickname || '') + ')</span>';
    }

    // About paragraphs
    document.getElementById('hp-about').innerHTML =
      data.about.map(function(p) { return '<p>' + p + '</p>'; }).join('');

    // Services (first half left column, second half right column)
    var half = Math.ceil(data.services.length / 2);
    [['services-col-1', 0], ['services-col-2', 1]].forEach(function(pair) {
      var id = pair[0], i = pair[1];
      document.getElementById(id).innerHTML = data.services
        .slice(i * half, (i + 1) * half)
        .map(function(s) {
          return '<div class="info-block-w-icon">' +
            '<div class="ci-icon"><i class="lnr ' + s.icon + '"></i></div>' +
            '<div class="ci-text"><h4>' + s.title + '</h4><p>' + s.description + '</p></div>' +
            '</div>';
        }).join('');
    });

    // Timeline helper — divider-mini is a small dot, others are logo circles
    function dividerClasses(cls) {
      return cls === 'divider-mini' ? 'divider divider-mini' : 'divider divider-image ' + cls;
    }

    // Experience timeline
    document.getElementById('experience-timeline').innerHTML = data.experience.map(function(e) {
      return '<div class="timeline-item clearfix">' +
        '<div class="left-part">' +
          (e.company ? '<h4 class="item-title">' + e.company + '</h4>' : '') +
          '<h5 class="item-period">' + e.period + '</h5>' +
          '<span class="item-company">' + e.location + '</span>' +
        '</div>' +
        '<div class="' + dividerClasses(e.dividerClass) + '"></div>' +
        '<div class="right-part">' +
          '<h4 class="item-title">' + e.role + '</h4>' +
          '<p>' + e.description + '</p>' +
        '</div>' +
        '</div>';
    }).join('');

    // Education timeline
    document.getElementById('education-timeline').innerHTML = data.education.map(function(e) {
      return '<div class="timeline-item clearfix">' +
        '<div class="left-part">' +
          '<h4 class="item-title">' + e.school + '</h4>' +
          '<h5 class="item-period">' + e.period + '</h5>' +
          '<span class="item-company">' + e.location + '</span>' +
        '</div>' +
        '<div class="' + dividerClasses(e.dividerClass) + '"></div>' +
        '<div class="right-part">' +
          '<h4 class="item-title">' + e.degree + '</h4>' +
          '<p>' + e.description + '</p>' +
        '</div>' +
        '</div>';
    }).join('');

    // Language skills — bar chart
    document.getElementById('language-skills').innerHTML = data.languageSkills.map(function(s) {
      return '<div class="clearfix"><h4>' + s.name + '</h4></div>' +
        '<div class="skill-container">' +
        '<div class="skill-percentage skill-' + s.level + '"></div>' +
        '</div>';
    }).join('');

    // Contact
    document.getElementById('contact-location').textContent = data.contact.location;
    document.getElementById('contact-email').textContent = data.contact.email;
    document.getElementById('contact-email-link').href =
      'mailto:' + data.contact.email + '?subject=Hi%20from%20&body=%0A%0ASent%20from%20oleinik.io';

    // Coding skills — word cloud, laid out once the resume section is visible
    var blues = ['#0d47a1', '#1565c0', '#1976d2', '#1e88e5', '#2196f3', '#42a5f5', '#1a237e', '#283593'];

    var cloudWords = data.codingSkills
      .slice()
      .sort(function(a, b) { return b.level - a.level; })
      .map(function(s, i) {
        var size = 12 + (s.level / 100) * 22;
        return { text: s.name, size: size, color: blues[i % blues.length] };
      });

    function layoutCloud() {
      var container = document.getElementById('coding-skills');
      var containerWidth = container.offsetWidth;
      if (!containerWidth) return false;

      // Approximate glyph width for this bold sans-serif font; pad for spacing
      var pad = 10;
      var items = cloudWords.map(function(w) {
        return { text: w.text, size: w.size, color: w.color,
                 w: w.text.length * w.size * 0.58 + pad,
                 h: w.size * 1.4 + pad };
      });

      var placed = [];
      var cx = containerWidth / 2;
      var cy = 0;

      items.forEach(function(item) {
        var w = item.w, h = item.h;
        var found = null;
        // Archimedean spiral; stretch horizontally to fill the column width
        for (var step = 0; step < 8000; step++) {
          var angle = step * 0.42;
          var r = step * 0.35;
          var x = cx + r * Math.cos(angle) * 1.8 - w / 2;  // wider horizontal spread
          var y = cy + r * Math.sin(angle) - h / 2;
          // Keep within column bounds
          if (x < 0 || x + w > containerWidth) continue;
          var ok = placed.every(function(p) {
            return x + w <= p.x || x >= p.x + p.w || y + h <= p.y || y >= p.y + p.h;
          });
          if (ok) { found = { x: x, y: y, w: w, h: h }; break; }
        }
        item.pos = found;
        if (found) placed.push(found);
      });

      if (!placed.length) return true;

      var minY = placed.reduce(function(m, p) { return Math.min(m, p.y); }, 0);
      var maxY = placed.reduce(function(m, p) { return Math.max(m, p.y + p.h); }, 0);

      container.innerHTML = '';
      container.style.height = (maxY - minY + 8) + 'px';

      items.forEach(function(item) {
        if (!item.pos) return;
        var span = document.createElement('span');
        span.className = 'skill-word';
        span.textContent = item.text;
        span.style.left  = item.pos.x + 'px';
        span.style.top   = (item.pos.y - minY) + 'px';
        span.style.fontSize = item.size + 'px';
        span.style.color = item.color;
        container.appendChild(span);
      });

      return true;
    }

    // Try immediately (if resume is already active), then watch for it becoming active
    if (!layoutCloud()) {
      var resumeSection = document.querySelector('section[data-id="resume"]');
      var done = false;
      var observer = new MutationObserver(function() {
        if (!done && resumeSection.classList.contains('pt-page-current')) {
          done = true;
          observer.disconnect();
          // One rAF to let the browser finish making the section visible
          requestAnimationFrame(function() { layoutCloud(); });
        }
      });
      observer.observe(resumeSection, { attributes: true, attributeFilter: ['class'] });
    }

  });

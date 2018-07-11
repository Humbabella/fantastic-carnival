HL = {
	
	c: function (x, y) {
		if (typeof(x)=='function') return x(y);
		return x;
	},
	
	d: function (x) {
		var r = {}, i;
		for (i in x) r[i] = x[i];
		return r;
	},
	
	new_html: function (type, parent, className, inner) {
		var r = document.createElement(type);
		if (parent) {
			if (parent.add_html) parent.add_html(r);
			else parent.appendChild(r);
		}
		if (className) r.className = className;
		if (inner) r.innerHTML = inner;
		return r;
	},
	
	rand_norm: function (mean, stddev) {
		var u = Math.random(), v = Math.random();
		return mean + stddev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
	},
	
	r: function (x) {
		if (Array.isArray(x)) return x[Math.floor(Math.random()*x.length)]
		if (typeof(x)=='number') return Math.floor(Math.random()*x);
		if (typeof(x)=='object') {
			var l = 0;
			for (var i in x) l += x[i] && x[i].chance || 1;
			l = Math.floor(Math.random()*l);
			for (i in x) {l -= x[i] && x[i].chance || 1; if (l < 0) return i}
		}
		return Math.random();
	},
	
	t: function (t) {
		var m = Math.max(0, Math.floor(t/60)), s = Math.max(0, Math.floor(t%60));
		s = (s<10 ? '0'+s : s);
		return m + ':' + s
	},
	
	add_class: function (e, c) {
		if (e.className.search(c)!=-1) return;
		e.className = e.className + ' ' + c;
	},
	
	remove_class: function (e, c) {
		e.className = e.className.replace(c, '').replace('  ', ' ').trim();		
	},
	
	keyDown: function (e) {
		if (e.keyCode=16) HL.shift_key = true;
	},
	
	keyUp: function (e) {
		if (e.keyCode=16) HL.shift_key = false;
	}
	
}
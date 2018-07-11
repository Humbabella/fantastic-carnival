game.clock = function birth_clock () {
	var ticker, clock = game.new_widget({id: 'clock'});
	
	clock.aut = 1;
	clock.tick_fragments = 0;
	clock.ticks_this_aut = 0;
	clock.total_time = 0;
	clock.mods = [];
	clock.tick_list = [];
	clock.unlock_list = {};
	clock.total_clicks = 0;
	
	clock.html = HL.new_html('div', game.regions.log, 'clock');
	clock.html_time = HL.new_html('div', clock.html, 'clock_time');
	
	game.time_moving = false;
	
	var fps = 4;
	
	game.create_cvar(clock, 'aut_length', 1800);
	game.create_cvar(clock, 'dilation', 1);
	
	var dilation_roll = HL.rand_norm(1, 0.125);
	
	function calculate_tick_amount () {clock.tick_amount = 1 / clock.aut_length};
	function calculate_time_adjustment () {clock.time_adjustment = clock.aut_length * clock.dilation / fps};
		
	var random_adjuster = game.create_mod(clock, 'clock', 'dilation', function (x) {return x * dilation_roll}, 700);
	var adjust_for_fps = game.create_mod(clock, 'clock', 'aut_length', function (x) {return x * fps}, 10);
	
	game.apply_mod(random_adjuster);
	game.apply_mod(adjust_for_fps);
	game.on_cvar_update('clock', 'aut_length', calculate_tick_amount);
	game.on_cvar_update('clock', 'aut_length', calculate_time_adjustment);
	game.on_cvar_update('clock', 'dilation', calculate_time_adjustment);
	
	calculate_tick_amount();
	calculate_time_adjustment();
	
	Object.defineProperties(clock, {
		fps: {
			get: function () {return fps},
			set: function (v) {
				clock.stop();
				fps = v;
				clock.start();
			}
		},
		dilation_roll: {
			get: function () {return dilation_roll},
			set: function (v) {
				dilation_roll = v;
				game.compute_cvar('clock', 'dilation');
			}
		}
	})

	function any_click () {
		clock.total_clicks ++;
	}
	
	document.body.addEventListener('click', any_click);
	
	function tick () {
		var num_ticks = 1 / clock.dilation;
		if (clock.last_time) {
			var new_time = new Date().getTime();
			var time_elapsed = (new_time - clock.last_time) / 1000;
			clock.total_time += time_elapsed;
			num_ticks = time_elapsed / clock.dilation * fps;
			clock.last_time = new_time;
		} else {
			clock.last_time = new Date().getTime;
		}
		clock.tick_fragments += num_ticks;
		while (clock.tick_fragments > 1) {
			for (var i=0; i<game.each_tick.length; i++) game.each_tick[i](new_time);
			for (i in game.act) game.act[i].cooling += clock.tick_amount;
			clock.ticks_this_aut++;
			clock.tick_fragments--;
		}
		if (clock.ticks_this_aut >= clock.aut_length) aut();
		clock.format_time = HL.t((1 - (clock.ticks_this_aut + clock.tick_fragments) / clock.aut_length) * clock.time_adjustment);
		clock.html_time.innerHTML = 'Epoch ' + clock.aut + '<br>Next Epoch: ' + clock.format_time;
		game.do_event('clock', 'check_time');
		var t = new Date().getTime() - new_time;
		game.debug_window.innerHTML = t;
	}
	
	function aut () {
		clock.aut++;
		clock.ticks_this_aut = 0;
		clock.dilation_roll = HL.rand_norm(1, 0.125);
		game.compute_cvar('clock', 'dilation');
		for (var i=0; i<game.each_aut.length; i++) game.each_aut[i]();
	}
	
	clock.start = function () {
		clock.last_time = new Date().getTime();
		game.time_moving = true;
		game.update_all_cvars({clock_start: true});
		ticker = setInterval(tick, 1000/fps);
	}
	
	clock.stop = function () {
		game.time_moving = false;
		clearInterval(ticker);
	}
	
	clock.save = function () {return [clock.ticks_this_aut, clock.dilation_roll, clock.aut, clock.last_time, clock.total_time, clock.total_clicks]}
	clock.load = function (load_arr) {
		clock.ticks_this_aut = load_arr[0];
		clock.dilation_roll = load_arr[1];
		clock.aut = load_arr[2];
		clock.last_time = false;
		clock.total_time = load_arr[4];
		clock.total_clicks = load_arr[5] || 0;
		clock.last_click = new Date().getTime();
		var since_load = new Date().getTime() - load_arr[3];
		game.resources.adjust('lost_epochs', since_load / 18000);
	}
	
	return clock
	
} ()

game.pantheon = function birth_pantheon () {
	var pn = game.new_widget({id: 'pantheon'});
	
	pn.html_log = HL.new_html('div', game.regions.log, 'active_stars');
	
	game.create_cvar(pn, 'foresight', 3)
	
	pn.activate = function (deity, value) {
		if (typeof(value)==='undefined') value = true;
		deity.active = value;
		for (i in deity.mods) deity.mods[i].disabled = !value;
		game.apply_mods(deity);
		if (deity.apply) deity.apply(deity, value);
		deity.calendar_html.style.display = value ? 'block' : 'none';
	}
	
	pn.epoch = function () {
		for (var i in game.deity) {
			if (game.deity[i].unlocked) {
				if (game.deity[i].active) pn.activate(game.deity[i], false);
				game.deity[i].next--;
				if (game.deity[i].next===0) {
					pn.activate(game.deity[i]);
					pn.set_next(game.deity[i]);
				}
				pn.draw_next(game.deity[i])
			}
		}
	}
	game.each_aut.push(pn.epoch);
	
	pn.draw_next = function (deity) {
		if (deity.active) deity.next_html.innerHTML = ' (Active)';
		else if (deity.next<pn.foresight) deity.next_html.innerHTML = ' (' + deity.next + ')';
		else deity.next_html.innerHTML = '';
	}
	
	pn.set_next = function (deity) {
		var r = HL.r(), d;
		if (r<.1) d = HL.r(4)+3;
		else if (r<.7) d = HL.r(15)+14;
		else d = HL.r(20)+26;
		deity.next = Math.floor(d * deity.delay);
	}
	
	pn.unlock = function () {
		game.junction.unlock('heavens', 'deities');
	}
	
	return pn;
	
} ()

/*game.starchart = function birth_starchart() {
	var sc = game.new_widget({id: 'starchart'})
	sc.html = HL.new_html('div', false, 'starchart');
	sc.html_highlight = HL.new_html('div', sc.html, 'starchart_highlight');
	sc.html_left_border = HL.new_html('div', sc.html, 'starchart_left_border');
	sc.html_right_border = HL.new_html('div', sc.html, 'starchart_right_border');
	sc.html_log = HL.new_html('div', game.regions.log, 'active_stars');
	sc.html_omen = HL.new_html('div', sc.html_log, 'active_stars');
	sc.signs = [];
	sc.stars = [];
	sc.omens = [];
	sc.next_sign = 3;
	sc.next_star = .01 + HL.r() * .15;
	sc.showing = false;
	
	game.junction.add_html(sc.html, true, 'heavens', 'starchart');
	
	game.create_cvar(sc, 'foresight', 3.5);
	game.create_cvar(sc, 'ominousness', 0);
	
	sc.redraw_highlight = function () {
		var w = 50 / sc.foresight
		sc.html_highlight.style.right = (w + 1) + '%'
		sc.html_highlight.style.width = (2 * w + 1) + '%'
	}
		
	sc.html.update = function () {
		for (var i = 0; i < sc.signs.length; i++) {
			sc.signs[i].html.style.right = (sc.signs[i].time * 100 / sc.foresight + 1) + '%';
		}
		for (i = 0; i < sc.stars.length; i++) {
			sc.stars[i].html.style.right = (sc.stars[i].time * 100 / sc.foresight + 1) + '%';
		}
		for (i = 0; i < sc.omens.length; i++) {
			sc.omens[i].html.style.right = (sc.omens[i].time * 100 / sc.foresight + 1) + '%';
		}
	}
	
	game.on_cvar_update('starchart', 'foresight', sc.redraw_highlight);
	game.on_cvar_update('starchart', 'foresight', sc.html.update);

	sc.unlock = function () {
		game.junction.unlock('heavens', 'starchart');
	}
	
	sc.advance_signs = function () {
		sc.next_sign -= game.clock.tick_amount;
		sc.next_star -= game.clock.tick_amount;
		if (sc.next_sign <= 0) {
			sc.next_sign = 0.5 + HL.r() * 3;
			sc.create_sign();
		}
		if (sc.next_star <= 0) {
			sc.next_star = .03 + HL.r() * .2
			sc.create_star();
		}
		var i = 0;
		while (i < sc.signs.length) {
			sc.signs[i].time -= game.clock.tick_amount * sc.signs[i].speed;
			if (!sc.signs[i].active && sc.signs[i].time <= 1.5 && sc.signs[i].time > 0.5) sc.activate(sc.signs[i]);
			if (sc.signs[i].active && sc.signs[i].time <= 0.5) sc.activate(sc.signs[i], false);
			if (sc.signs[i].time<=0) sc.destroy(sc.signs[i], 'sign'); else i++;
		}
		i = 0;
		while (i < sc.stars.length) {
			sc.stars[i].time -= game.clock.tick_amount * sc.stars[i].speed;
			if (sc.stars[i].time<=0) sc.destroy(sc.stars[i], 'star'); else i++;
		}
		i = 0;
		while (i < sc.omens.length) {
			sc.omens[i].time -= game.clock.tick_amount * sc.omens[i].speed;
			if (sc.omens[i].time<=0) sc.destroy(sc.omens[i], 'omen'); else i++;
		}
		if (sc.active_omen) {
			sc.active_omen.time -= game.clock.tick_amount;
			if (sc.active_omen.time<=0) sc.stop_active_omen();
		}
	}
	
	sc.activate = function (sign, value) {
		if (!sign.deity) return;
		var d = game.deity[sign.deity];
		if (typeof(value)=='undefined') value = true;
		sign.active = value;
		if (value) {
			HL.add_class(sign.html, 'starsign_active');
		} else {
			HL.remove_class(sign.html, 'starsign_active');
		}
		sc.check_deity(d);
	}
	
	sc.check_deity = function (d) {
		var a = false;
		for (var i in d.signs) if (d.signs[i].active) a = true;
		for (var i in d.mods) d.mods[i].disabled = !a;
		game.apply_mods(d);
		if (d.apply) sign.apply(d, a);
		d.calendar_html.style.display = a ? 'block' : 'none';
	}
	
	sc.destroy = function (obj, type) {
		var arr = sc[type+'s'];
		var k = arr.indexOf(obj);
		arr.splice(k, 1);
		sc.html.removeChild(obj.html);
		if (type=='sign') {
			k = game.deity[obj.deity].signs.indexOf(obj);
			game.deity[obj.deity].signs.splice(k, 1);
		}
	}
		
	sc.create_sign = function (args) {
		if (args) {
			var d = game.deity[args.deity];
		} else {
			var d = game.deity[HL.r(game.deity)];
			args = {}
		}
		var sign = {
			html: HL.new_html('div', sc.html, 'starsign', d.sign_icon + '&#65038;'),
			deity: d.id,
			time: args.time || sc.foresight + 2,
			speed: args.speed || 1,
			click_me: function (e) {sc.click_sign(sign.deity)}
		}
		
		sign.html.addEventListener('click', sign.click_me);
		sc.signs.push(sign);
		d.signs.push(sign);
	}
	
	sc.click_sign = function (deity_id) {
		var d = game.deity[deity_id];
		if (sc.showing) sc.showing.html.style.display = 'none';
		if (sc.showing == d) return;
		sc.showing = d;
		d.html.style.display = 'block';
	}
	
	sc.create_star = function (at) {
		var star = {
			html: HL.new_html('div', sc.html, 'star', '&#183;'),
			time: at || sc.foresight,
			speed: HL.rand_norm(1, .2)
		}
		star.html.style.top = HL.r(50) + 'px';
		sc.stars.push(star);
	}
	
	sc.create_omen = function (args) {
		var o;
		if (args) {
			o = game.omen[args.parent]
		} else {
			var o = game.omen[HL.r(game.omen)];
			args = {}
		}
		var omen = {
			html: HL.new_html('div', sc.html, 'starsign', '!'),
			parent: o.id,
			time: args.time || sc.foresight,
			speed: args.speed || 10,
		}
		omen.html.addEventListener('click', function () {sc.click_omen(omen)});
		sc.omens.push(omen);
		game.junction.alert_tab('heavens');
	}
	
	sc.click_omen = function (o) {
		if (sc.active_omen) sc.stop_active_omen();
		sc.active_omen = o;
		var p = game.omen[sc.active_omen.parent];
		sc.html_omen.innerHTML = p.title;
		sc.destroy(o, 'omen');
		if (p.apply) p.apply(true);
		for (var i in p.mods) p.mods[i].disabled = false;
		game.apply_mods(p);
		sc.active_omen.time = p.duration;
		game.resources.adjust('foreboding', 1);
	}
	
	sc.stop_active_omen = function () {
		if (!sc.active_omen) return;
		var o = game.omen[sc.active_omen.parent];
		sc.html_omen.innerHTML = '';
		if (o.apply) o.apply(false);
		for (var i in o.mods) o.mods[i].disabled = true;
		game.apply_mods(o);
		sc.active_omen = false;
	}
	
	sc.fill_with_stars = function () {
		var next = .03 + HL.r() * .2
		while (next < sc.foresight + 2) {
			sc.create_star(next);
			next += .03 + HL.r() * .2;
		}
	}
	
	sc.save = function () {
		var r = [[],[],sc.next_omen,sc.next_sign];
		for (var i=0; i < sc.signs.length; i++) {
			r[0][i] = [sc.signs[i].deity, sc.signs[i].time, sc.signs[i].speed]
		}
		for (i=0; i<sc.omens.length; i++) {
			r[1][i] = [sc.omens[i].parent, sc.omens[i].time, sc.omens[i].speed]
		}
		return r
	}
	
	sc.load = function (load_arr) {
		if (load_arr[0]) for (var i=0; i<load_arr[0].length; i++) sc.create_sign({deity: load_arr[0][i][0], time: load_arr[0][i][1], speed: load_arr[0][i][2]});
		if (load_arr[1]) for (i=0; i<load_arr[1].length; i++) sc.create_omen({parent: load_arr[1][i][0], time: load_arr[1][i][1], speed: load_arr[1][i][2]});
		for (i in game.deity) sc.check_deity(game.deity[i]);
		if (sc.omens.length) game.alert_tab('heavens');
		if (typeof(load_arr[2])=='number') sc.next_omen = load_arr[2];
		if (typeof(load_arr[3])=='number') sc.next_sign = load_arr[3];
	}
	
	game.each_tick.push(sc.advance_signs);
	
	return sc;
	
} ()*/


game.jobs = function birth_jobs () {
	var job = game.new_widget({id: 'jobs'});
	
	job.generate_resource = function (j, n, a) {
		game.create_cvar(j, n + '_effect', a);
		j.mods.push(game.create_mod(j, n, 'up_tick', function (x, me) {
			me.total_effect = me[n + '_effect'] * me.count * job.level_bonus(me.level);
			return x + me.total_effect;
		}, 400))
		game.on_cvar_update(j.id, n + '_effect', function () {game.apply_mods(j); j.update_efficiency_info()});
		j.generates.push(n);
	}
	
	job.level_cost = function () {
		return {culture: 5};
	}
	
	
	job.gain_experience = function (id, amount) {
		var j = game.job[id];
		j.experience += amount;
		if (j.experience > job.level_amount(j.level)) job.level_up(j);
	}
	
	job.level_amount = function (level) {
		return Math.round(5 * Math.pow((level+1), 2.8));
	}
	
	job.level_up = function (j) {
		j.experience -= job.level_amount(j.level);
		j.level++;
		game.apply_mods(j);
	}
	
	job.level_bonus = function (level) {
		return 1 + .05 * level;
	}
	
	job.unlock = function () {
		game.junction.unlock('social', 'professions');
	}
	
	return job;
} ()

game.log = function birth_log () {
	var log = game.new_widget({id: 'log'});
	
	log.logs = {};
	
	log.html = HL.new_html('div', game.regions.log, 'log');
	log.html_head = HL.new_html('div', log.html, 'log_header');
	log.html_body = HL.new_html('div', log.html, 'log_body');
	
	log.showing = false;
	
	log.show = function (sub_log) {
		if (log.showing) {
			HL.remove_class(log.showing.html_head, 'sub_log_header_select');
			log.html_body.removeChild(log.showing.html_body);
		}
		log.html_body.appendChild(sub_log.html_body);
		HL.add_class(sub_log.html_head, 'sub_log_header_select');
		log.showing = sub_log;
	}
	
	log.new_log = function (args) {
		var i, sub_log = {
			name: args.name,
			lines: [],
			validate: args.validate,
			html_head: HL.new_html('div', false, 'sub_log_header', args.title),
			html_body: HL.new_html('div', false, 'sub_log_body'),
			click_me: function (e) {game.log.show(sub_log)}
		}
		
		sub_log.html_head.addEventListener('click', sub_log.click_me);
		log.logs[sub_log.name] = sub_log;
		log.html_head.appendChild(sub_log.html_head);
	}
	
	log.add = function (message, type) {
		if (!game.time_moving) return;
		if (game.clock.format_time) {
			message = '<span class=\'strong\'>' + game.clock.aut + ':' + game.clock.format_time + '</span> - '+ '<span class=\'log_line_' + type + '\'>' + message + '</span><br>';
		} else {
			message = '<span class=\'log_line_' + type + '\'>' + message + '</span><br>';
		}
		for (var i in log.logs) {
			if (log.logs[i].validate(type)) {
				log.logs[i].lines.unshift(message);
				while (log.logs[i].lines.length > 40) log.logs[i].lines.pop();
				var l = '';
				for (var j in log.logs[i].lines) l += log.logs[i].lines[j];
				log.logs[i].html_body.innerHTML = l;
			}
		}
	}
	
	return log;
	
} ()

for (var i in data.logs) game.log.new_log(data.logs[i]);

game.save_station = {} // TODO

game.heavens = {} //TODO (avec deity chooser? I don't think so)

game.temple = function birth_temple() {
	var temple = game.new_widget({id: 'temple'})
	
	temple.title = 'Temple';
		
	temple.html = HL.new_html('div', false, 'temple_main');
	temple.html_cost = HL.new_html('div', temple.html, 'temple_cost');
	temple.html_button = HL.new_html('div', temple.html, 'temple_button', 'Peer Within');
	
	game.add_button_animation(temple.html_button);
	
	temple.html.update = function () {
		var c = game.resources.consider(temple.cost);
		if (c.cant_pay) HL.add_class(temple.html_button, 'greyed_out');
		else HL.remove_class(temple.html_button, 'greyed_out');
		temple.html_cost.innerHTML = c.format;
	}
	
	temple.expand_heading = 'Peer Within';
	temple.expand_message = 'Your influence is diffused across aeons and untold spaces. Look instead at a tiny place where dark shapes gather.';
	
	temple.mods = [
		game.create_mod(temple, 'whisper', 'cost', function (x) {var r = HL.d(x); r.will*=temple.level+1; return r}, 700),
		game.create_mod(temple, 'whisper', 'amount', function (x) {return x * (temple.level + 1)}, 700),
		game.create_mod(temple, 'influence', 'up_tick', function (x) {return x + 150 * temple.level}, 400)
	]
	
	var suppress_inveiglement = game.create_mod(temple, 'inveiglement', 'up_tick', function (x) {return 0}, 1000);
	game.apply_mod(suppress_inveiglement);
	
	var rename = {}
	rename.humans = game.create_mod(temple, 'humans', 'title', function (x) {return 'Followers'}, 10);
	rename.labour = game.create_mod(temple, 'labour', 'title', function (x) {return 'Labour'}, 10);
	rename.worshipper = game.create_mod(temple, 'worshipper', 'title', function (x) {return 'Worshipper'}, 10);
	rename.labourer = game.create_mod(temple, 'labourer', 'title', function (x) {return 'Labourer'}, 10);
	rename.hunter = game.create_mod(temple, 'hunter', 'title', function (x) {return 'Gatherer'}, 10);
	rename.arrive_message = game.create_mod(temple, 'inveiglement', 'arrive_message', function () {return 'A follower arrives and begins worshipping.'}, 10);
	rename.leave_message = game.create_mod(temple, 'disillusionment', 'leave_message', function () {return 'A follower abandons you and leaves.'}, 10);
	rename.exposure_message = game.create_mod(temple, 'exposure', 'exposure_message', function () {return 'A follower dies of exposure.'}, 10);
	rename.starve_message = game.create_mod(temple, 'humans', 'starve_message', function () {return 'A follower dies of starvation.'}, 10);
	rename.dark_lens_tab = game.create_mod(temple, 'tab_temple', 'title', function () {return 'Dark Lens'}, 10);
	rename.followers_tab = game.create_mod(temple, 'tab_cult', 'title', function () {return 'Followers'}, 10);
	
	game.junction.add_html(temple.html, true, 'temple', 'expand');
	
	temple.level = 0;
	temple.cost = {cost: {will: 10, influence: 10}};
	
	function level_up () {
		var c = game.resources.consider(temple.cost);
		if (c.cant_pay) return;
		c.pay();
		temple.cost.paid = {};
		temple.html_button.animate();
		temple.level++;
		set_level_info();
		game.apply_mods(temple);
	}
	
	function level_up_tooltip (e) {game.tooltip.show(e, temple.expand_message, temple.expand_heading);}
	
	temple.html_button.addEventListener('click', level_up);
	temple.html_button.addEventListener('mouseover', level_up_tooltip);
	temple.html_button.addEventListener('mouseout', game.tooltip.hide);
	
	function set_level_info() {
		switch (temple.level) {
			case 1:
				temple.cost.cost = {
					will: 20,
					influence: 50,
					labour: 5
				}
				temple.expand_heading = 'Dark Lens';
				temple.expand_message = 'This aparatus allows you to focus the darkness and see clearly the world the dark shapes inhabit.';
				game.remove_mod(suppress_inveiglement);
				game.unlock('sustain');
				game.unlock('production');
				game.junction.unlock('cult');
				game.timers.adjust('inveiglement', .97);
				break;
			case 2:
				temple.cost.cost = {
					will: 10,
					influence: 100,
					labour: 100,
					fabrications: 100,
					knowledge: 25,
					humans: 3
				}
				temple.expand_heading = 'Focused Lens';
				temple.expand_message = 'Focus the lens to allow you to see deeper into the space of your followers.';
				game.unlock('enlightenment');
				game.unlock('time');
				game.morph_text(game.tabs.cult.sections.humans.html_head_text, 'Followers');
				for (var i in rename) game.apply_mod(rename[i]);
				break;
			case 3:
				temple.cost.cost = {
					will: 1/0
				}
				temple.expand_heading = 'Unknown';
				temple.expand_message = 'What might one day be here?';
				game.unlock('exploration');
				game.unlock('agriculture');
				break;
		}
		game.morph_text(temple.html_button, temple.expand_heading);
	}
	
	temple.save = function () {return [temple.level]}
	temple.load = function (load_arr) {
		for (var i = 0; i<load_arr[0]; i++) {
			temple.level++;
			set_level_info()
		}
		game.apply_mods(temple);
	}
	
	return temple;
} ();

game.timers = function birth_timers () {
	var ts = game.new_widget({id: 'timers'});

	ts.adjust = function (id, up) {
		var r = typeof(id)=='string' ? game.ids[id] : id;
		if (up<=0 || r.max <=0) return;
		r.value += up;
		if (r.value > r.max) {
			game.do_event(r, 'complete', {});
			r.value -= r.max;
		}
	}
	
	ts.set = function (id, value) {
		var r = typeof(id)=='string' ? game.ids[id] : id;
		r.value = value;
	}

	
	ts.tick_all = function () {
		for (var i in game.timer) {
			ts.adjust(i, game.timer[i].up_tick);
		}
	}
	
	ts.remain = function (id) {
		var r = typeof(id)=='string' ? game.ids[id] : id;
		if (r.up_tick <= 0) return 'Indefinite';
		return HL.t((r.max - r.value)/(r.up_tick * game.clock.aut_length) * game.clock.time_adjustment);
	}
	
	game.each_tick.push(ts.tick_all);
	
	return ts
	
} ();

game.resources = function birth_resources () {
	var res = game.new_widget({id: 'resources'});
	
	res.draw_max = function (id) {
		var r = typeof(id)=='string' ? game.ids[id] : id;
		if (r.max) r.html_max.innerHTML = ' / '+r.max;
		else if (!r.no_max) r.html_max.innerHTML = ' / 0';
	}
	
	res.draw_tick = function (id) {
		var r = typeof(id)=='string' ? game.ids[id] : id;
		if (r.id=='labour') {
			blah = 1;
		}
		var t = r.up_tick - r.down_tick;
		if (r.format_tick) t = r.format_tick(t, r);
		else t = res.format_tick(t, r);
		r.html_tick.innerHTML = t;
	}

	res.format_tick = function (value) {
		if (value == 0) return '';
		if (value > 0) return '(waxing)';
		return '(waning)'
	}

	res.adjust = function (id, up, down, ignore_cap) {
		if (!down) down = 0;
		var r = typeof(id)=='string' ? game.ids[id] : id;
		if (r.object_type == 'resource') {
			r.hold = 0;
			r.fraction += up - down;
			if (r.fraction >= 1 || r.fraction < 0) {
				var old_value = r.value, w = Math.floor(r.fraction);
				r.fraction -= w;
				r.value += w;
				if (r.value > r.max && !ignore_cap) {
					var args = {value: r.value, old_value: old_value}
					args = game.do_event(r, 'overflow', args);
					r.value = args.value;
				}
				if (r.value < 0) {
					r.sub_zero -= r.value + r.fraction;
					var args = {value: r.value, old_value: old_value, sub_zero: r.sub_zero};
					args = game.do_event(r, 'zero', args);
					if (r.sub_zero > 1) {
						args = game.do_event(r, 'sub_zero', args);
						r.sub_zero = 0;
					}
					r.value = 0;
					r.fraction = 0;
				}
				game.do_event(r, 'update_value', {value: r.value, old_value: old_value});
				game.apply_mods(r);
				var t;
				if (r.format_value) t = r.format_value(r);
				else t = res.format_value(r);
				r.html_value.innerHTML = t;
			}
			res.total_gained += up;
			res.total_lost += down;
			return {gain: typeof(old_value)==='number' ? r.value - old_value : 0};
		} else if (r.object_type == 'specie') {
			game.species.adjust(r, up, 0, down);
			return {gain: up - down};
		} else if (r.object_type == 'work') {
			r.buy(r.value + up - down);
			return {gain: up - down};
		} else if (r.object_type == 'science') {
			game.research.complete(r, r.value + up - down);
			return {gain: up - down};
		}
	}
	
	res.set = function (id, value) {
		var r = typeof(id)=='string' ? game.ids[id] : id;
		r.value = value;
		r.fraction = 0;
		game.do_event(r, 'update_value');
		var t = r.value;
		if (r.format_value) t = r.format_value(r);
		else t = res.format_value(r);
		r.html_value.innerHTML = t;
	}
	
	res.is_zero = function (id) {
		var r = typeof(id)=='string' ? game.ids[id] : id;
		if (r.value <=0 && r.fraction <=0) return true;
		return false;
	}
	
	res.format_value = function (r) {
		if (r.value > r.max && !r.no_max) return '<span class=\'resource_warn_bright\'>'+r.value+'</span>';
		else return r.value;
	}
	
	res.tick_all = function () {
		for (var i in game.resource) {
			var old_value = game.resource[i].value;
			if (!game.resource[i].hold) res.adjust(i, game.resource[i].up_tick, game.resource[i].down_tick);
			if (game.resource[i].value===old_value + 1 && game.resource[i].down_tick>game.resource[i].up_tick) game.resource[i].hold = 1; //this is to prevent numbers from jumping back and forth. I'm not sure it's good it should be removed whenever the resource value changes or it's up or down tick changes
		}
	}
	
	res.consider = function (cost_object) {
		
		function cant_pay_result() {
			return {
				cant_pay: true,
				format: format,
				pay: function () {
					console.log('Hey, you called pay despite not being able to pay, that\'s not right')
				}
			}
		}
		
		function normal_pay_result () {
			var result = {
				format: format,
				pay: function () {
					var is_paid = true;
					for (i in price) {
						if (!cost_object.paid) cost_object.paid = {};
						if (!cost_object.paid[i]) cost_object.paid[i]=0;
						cost_object.paid[i] += price[i];
						res.adjust(i, 0, price[i]);
						if (cost_object.cost[i] > cost_object.paid[i]) is_paid = false;
					}
					if (cost_object.installments) {cost_object.installments.made += 1};
					if (is_paid) result.is_paid = true;
				}
			}
			return result
		}
		
		var price = {}, format = '', result = {}, cant_pay = false;
		var i, j;
		
		for (i in cost_object.cost) price[i] = cost_object.cost[i];
		
		if (cost_object.paid) {
			for (i in cost_object.paid) {
				if (price[i]) price[i] -= cost_object.paid[i];
				if (price[i]<0) price[i]=0;
			}
		}
		
		if (cost_object.installments) {
			var r = cost_object.installments.max - cost_object.installments.made;
			if (r>0) for (i in price) price[i] /= r;
		}
		
		for (i in price) price[i] = Math.max(0, Math.ceil(price[i]));
		
		var unpaid = {};
		for (i in price) {
			if (price[i] > 0) {
				unpaid[i] = price[i] - game.ids[i].value;
				var u = (unpaid[i] > 0);
				if (game.ids[i].format) format += game.ids[i].format(price[i], u);
				else format += game.ids[i].title + ' ' + (u ? '<span class=\'resource_warn_bright\'>' : '') + price[i] + (u ? '</span>' : '');
				format += ', ';
				if (u) cant_pay = true;
			}
		}
		
		if (format.length>0) {
			format = format.substring(0, format.length - 2);
			if (cost_object.installments&&cost_object.installments.max>1) {
				format += ' (Part ' + (cost_object.installments.made + 1) + '/' + cost_object.installments.max + ')';
			}
		}
		else format = 'Nothing';
		
		if (!cost_object.substitutions) {
			if (cant_pay) return cant_pay_result();
			else return normal_pay_result();
		}
		
		var subs = {}, sub_made = false;
		cant_pay = false;
		
		for (i in unpaid) {
			if (unpaid[i]>0) {
				if (cost_object.substitutions[i]) {
					sub_made = true;
					for (j in cost_object.substitutions[i]) {
						if (!subs[j]) subs[j]=0;
						subs[j] = Math.ceil(unpaid[i]/cost_object.substitutions[i][j]);
						if (!subs[i]) subs[i]=0;
						subs[i] -= subs[j] * cost_object.substitutions[i][j];
						sub_made = true;
					}
				} else {
					cant_pay = true
				}
			}
		}
		
		if (cant_pay) return cant_pay_result();
		if (!sub_made) return normal_pay_result();
				
		var price_s = HL.d(price);
					
		for (i in subs) {
			if (!price_s[i]) price_s[i] = 0;
			price_s[i] += subs[i];
			if (price_s[i]<0) price_s[i] = 0;
		}			
		
		var format_s = format + '<br><span class=\'yellow-highlight\'>Buy now:</span> ';
		var can_sub = true;
		for (i in price_s) {
			if (price_s[i]) {
				if (!game.ids[i]||price_s[i]>game.ids[i].value) {
					return cant_pay_result();
				}
				else format_s += game.ids[i].format ? game.ids[i].format(price_s[i]) : game.ids[i].title + ' ' + price_s[i] + ', ';
			}
		}
		
		format_s = format_s.substring(0, format_s. length - 2)
		if (cost_object.installments&&cost_object.installments.max>1) {
			format_s += ' (Part ' + (cost_object.installments.made + 1) + '/' + cost_object.installments.max + ')';
		}
		
		result = {
			format: format_s,
			had_substitution: true,
			pay: function () {
				var is_paid = true;
				for (i in price) {
					if (!cost_object.paid) cost_object.paid = {};
					if (!cost_object.paid[i]) cost_object.paid[i] = price[i];
					if (cost_object.cost[i] >cost_object.paid[i]) is_paid = false;
				}
				for (i in price_s) {
					game.resources.adjust(i, 0, price_s[i]);
				}
				if (cost_object.installments) {cost_object.installments.made += 1};
				if (is_paid) result.is_paid = true;
			}
		}
		return result;
		
	}
	
	res.award = function (obj, ignore_cap) {
		
		var format = '', gain = {};
		
		for (var i in obj) {
			gain[i] = res.adjust(i, obj[i], 0, ignore_cap).gain;
			if (gain[i]>0) {
				if (game.ids[i].format) format += game.ids[i].format(gain[i]);
				else format += game.ids[i].title + ' ' + gain[i];
				format += ', ';
			}
		}
		
		if (format.length===0) format = 'Nothing';
		else format = format.substring(0, format.length - 2);
		
		return format;
		
	}
	
	game.each_tick.push(res.tick_all);
	
	return res;
} ();

game.warehouse = function birth_warehouse () {
	
	var wh = game.new_widget({id: 'warehouse'});
	game.create_cvar(wh, 'title', 'Storage');
	game.on_cvar_update('warehouse', 'title', function (args) {game.morph_text(wh.html_title, args.value)})
	game.create_cvar(wh, 'max', 0);
	game.create_cvar(wh, 'value', 0);
	
	wh.has_space = function () {return wh.value < wh.max}
	
	wh.html = HL.new_html('tr', game.resource_table[3], 'resource');
	wh.html_title = HL.new_html('td', wh.html, 'resource_title', wh.title);
	wh.html_value = HL.new_html('td', wh.html, 'resource_value', '0');
	wh.html_max = HL.new_html('td', wh.html, 'resource_max', ' / 0');	
	wh.html_tick = HL.new_html('td', wh.html, 'resource_tick');
	
	wh.draw_max = function () {wh.html_max.innerHTML = ' / ' + wh.max}
	wh.draw_value = function () {wh.html_value.innerHTML = wh.value}
	
	game.on_cvar_update('warehouse', 'max', wh.draw_max);
	game.on_cvar_update('warehouse', 'value', wh.draw_value);
	
	wh.allocate = function (store, amount) {
		if (!amount) amount = 1;
		store.value += amount;
		store.html_value.innerHTML = store.value;
		game.apply_mods(store);
		wh.draw_value();
	}
	
	wh.is_full = function () {
		return wh.value >= wh.max;
	}
	
	wh.unlock = function () {
		wh.html.style.display = 'table-row';
		game.resource_table[3].style.display = 'table';
	}
	
	return wh;
	
} ();

game.species = function birth_species () {
	var s = game.new_widget({id: 'species'});
	
	s.adjust = function (id, arrive, leave, kill) {
		if (!leave) leave = 0;
		if (!kill) kill = 0;
		var r = typeof(id)=='string' ? game.ids[id] : id, old_value = r.value;
		c = arrive - leave - kill;
		if (c != 0) {
			r.value += c;
			var args = {value: r.value, old_value: old_value, species: s}
			for (var i in r.jobs) args[i] = r.jobs[i].count;
			if (r.max && r.value > r.max) {
				args = game.do_event(r, 'overflow', args);
				r.value = args.value;
			}
			if (r.value <= 0) {
				args = game.do_event(r, 'zero', args);
				r.value = args.value;
				if (r.value < 0) r.value = 0;
			}
			args = game.do_event(r, 'update_value', args);
			s.redistribute(r);
			r.compute_food_share();
			game.apply_mods(r);
			r.html_value.innerHTML = r.value;
			r.draw_jobs();
		}
		if (kill>0) {
			args.killed = kill;
			args = game.do_event(r, 'kill', args);
		}
	}
	
	function distribute_job_array (arr, to_assign, target_total, total) { // for resdistribute
		var i, k;
		if (!target_total) target_total = 1;
		for (i in arr) {
			k = to_assign * arr[i].count / target_total;
			arr[i].base = Math.floor(k);
			arr[i].remainder = k - arr[i].base;
			total -= arr[i].base;
		}
		return total;
	}
	
	function assign_job_array (arr, total) { // for redistribute
		for (var i in arr) {
			total -= arr[i].count;
			arr[i].base = arr[i].count;
			arr[i].remainder = 0
		}
		return total;
	}
	
	s.redistribute = function (spc) { // sorry about this
		var job_array= {fixed: [], priority: [], other: []};
		var ratios = {fixed: 0, priority: 0, other: 0};
		var order = ['fixed', 'priority', 'other'];
		var remaining = spc.value;
		
		var i, ii, iii, category;
		
		for (i in spc.jobs) {
			if (spc.jobs[i].unlocked) {
				if (game.job[i].fixed) category = 'fixed';
				else if (spc.jobs[i].priority) category = 'priority';
				else category = 'other';
				job_array[category].push({count: spc.jobs[i].target, id: i})
				ratios[category] += spc.jobs[i].target
			}
		}
		
		var target_total = ratios.fixed + ratios.priority + ratios.other;
		
		if (target_total == spc.value) {
			for (i in spc.jobs) {
				if (spc.jobs[i].unlocked) {
					spc.jobs[i].count = spc.jobs[i].target;
				}
			}
			return;
		} else if (ratios.fixed > spc.value) {
			remaining = distribute_job_array(job_array.fixed, spc.value, ratios.fixed, remaining)
		} else if (target_total > spc.value) {
			remaining = assign_job_array(job_array.fixed, remaining);
			remaining = distribute_job_array(job_array.priority, remaining, ratios.priority + ratios.other, remaining);
			remaining = distribute_job_array(job_array.other, remaining, ratios.priority + ratios.other, remaining);
		} else {
			remaining = assign_job_array(job_array.fixed, remaining);
			if (ratios.other) remaining = assign_job_array(job_array.priority, remaining);
			else remaining = distribute_job_array(job_array.priority, remaining, ratios.priority, remaining);
			remaining = distribute_job_array(job_array.other, remaining, ratios.other, remaining)
		}
		
		for (i = 0; i < order.length; i++) {
			var cat = order[i];
			var r_count = 0;
			var roll;
			var assigned_remainder = 0;
			if (job_array[cat].length <= remaining) {
				for (ii in job_array[cat]) {
					if (job_array[cat][ii].remainder) {
						job_array[cat][ii].base++;
						remaining--;
					}
				}
			} else if (remaining > 0) {
				for (ii in job_array[cat]) r_count += job_array[cat][ii].remainder || 0;
				for (ii = 0; ii < remaining; ii++) {
					roll = HL.r() * r_count;
					for (iii in job_array[cat]) {
						roll -= job_array[cat][iii].remainder;
						if (roll < 0) {
							job_array[cat][iii].base++;
							assigned_remainder++;
							r_count -= job_array[cat][iii].remainder || 0;
							job_array[cat][iii].remainder = 0;
							break;
						}
					}
				}
				remaining -= assigned_remainder;
			}
			for (ii in job_array[cat]) {
				spc.jobs[job_array[cat][ii].id].count = job_array[cat][ii].base || 0;
			}
		}
	}
	
	return s;
	
} ();

game.research = function birth_research () {
	var r = game.new_project_manager({id: 'research', show_in: {tab: 'research', section: 'researching'}, project_word: 'research', timer: 'contemplate'});
	
	game.create_cvar(r, 'time_expansion', 1.1);
	game.create_cvar(r, 'cost_expansion', 1.145);
	game.create_cvar(r, 'cost_decay', .99);
	
	r.ages = [
		{bc: 1/5, bt: 1/6, ec: 1.2916, et: 1.1318, k: [0,0,0,0,0,0,0,0,0]},
		{bc: 2, bt: 1, ec: 1.1958, et: 1.3607, k: [0, 5, 10, 20, 40, 80, 150, 200]},
		{bc: 11, bt: 4.5, ec: 1.106, et: 1.1624, k: [150, 170, 190, 220, 230, 260, 290, 320, 350, 380, 410, 440, 470, 500, 500]},
		{bc: 30, bt: 20, ec: 1.05, et: 1.1, k: [300, 350, 400, 450]}
	]
	
	r.count_techs = function () {
		for (var i = 0; i < r.ages.length; i++) r.ages[i].c = 0;
		for (var i in game.tech) if (game.tech[i].age < 99 && (game.tech[i].complete || r.reseaching === game.tech[i])) r.ages[game.tech[i].age].c++;
		for (var i = 0; i < r.ages.length; i++) {
			r.ages[i].ci = r.ages[i].bc * Math.pow(r.ages[i].ec, r.ages[i].c);
			r.ages[i].ti = r.ages[i].bt * Math.pow(r.ages[i].et, r.ages[i].c);
			r.ages[i].ti_o = r.ages[i].bt * Math.pow(r.ages[i].et, r.ages[i].c - 1);
			r.ages[i].ki = r.ages[i].k[r.ages[i].c];
		}
		r.compute_all_techs();
	}
	
	game.on_cvar_update('research', 'time_expansion', r.count_techs);
	game.on_cvar_update('research', 'cost_expansion', r.count_techs);
	
	r.inflate_cost = function (x, tech) {
		if (tech.age===99) return x;
		var o = HL.d(x), a = r.ages[tech.age];
		for (var i in o) {o[i] *= a.ci}
		if (!o.knowledge) o.knowledge = 0;
		o.knowledge += a.ki;
		for (i in tech.fixed_cost) {
			if (!o[i]) o[i]=0;
			o[i] += tech.fixed_cost[i]
		}
		return o;
	}
	
	r.inflate_time = function (x, tech) {
		if (tech.age===99 || tech.no_knowledge) return x;
		var a = r.ages[tech.age]
		return x * (tech === r.current_project ? a.ti_o : a.ti);
	}
	
	r.onset = function (new_research) {
		if (r.current_project.object_type === 'tech' && game.time_moving) {
			r.count_techs();
			r.compute_all_techs();
		}
	}
	
	r.compute_all_techs = function () {
		for (var i in game.tech) {
			if (game.tech[i].unlocked && !game.tech[i].complete) {
				game.compute_cvar(i, 'cost');
				game.compute_cvar(i, 'time');
			}
		}
	}

	r.complete = function (tech, science_level) {
		if (tech.object_type == 'tech') {
			tech.complete = true;
			tech.ui.remove(tech.html_time);
			tech.html_button.style.display = 'none';
			tech.html_complete = HL.new_html('div', false, 'expander_header_append', ' (Complete)');
			tech.ui.add(tech.html_complete, 'head');			
			tech.html_button_text.innerHTML = 'Complete';
			game.junction.add_html(tech.html, false, tech.show_in.tab, 'completed');
			game.junction.unlock('research', 'completed');
			tech.ui.remove(tech.html_cost);
		} else {
			var l = science_level === 'auto' ? tech.value + 1 : science_level;
			tech.value = l;
			tech.html_value.innerHTML = ' (' + tech.value + ')';
			game.do_update(tech);
			game.compute_cvar(tech.id, 'cost');
			game.compute_cvar(tech.id, 'time');
			tech.html_button_text.innerHTML = 'Research';
		}
		if (r.current_project===tech) {
			r.stop_paying();
			r.current_cost = {};
		}
		game.do_update(tech);
	}
	
	return r;
	
} ();

game.projects = function birth_efforts () {
	var e = game.new_project_manager({id: 'projects', show_in: {tab: 'exploration', section: 'projects'}, project_word: 'project'});
	
	e.complete = function (proj) {
		game.do_update(proj);
		proj.html_button_text.innerHTML = 'Enact';
		if (game.world.selected === proj.target) game.world.select(proj.target);
		e.stop_paying();
		e.current_cost = {};
	}
	
	return e;
} ();

game.landmarks = function birth_landmarks () {
	
	var lm = game.new_widget({id: 'landmarks'});
	
	function getlm(t) {return typeof(t)==='string' ? game.landmark[t] : t;}
	
	lm.add_child = function (target, child) {
		var l = getlm(target);
		var k = l.children.indexOf(child);
		if (k!=-1) return;
		l.children.push(child);
		game.apply_mods(l);
	}
	
	lm.remove_child = function (target, child) {
		var l = getlm(target);
		var k = l.children.indexOf(child);
		if (k===-1) return;
		l.children.splice(k, 1);
		game.apply_mods(l);
	}
	
	lm.show = function (target) {
		var l = getlm(target.type);
		for (var i in l.widget_list) {game[l.widget_list[i]].show_instance(target)};
	}
	
	lm.hide = function (target) {
		var l = getlm(target.type);
		for (var i in l.widget_list) {game[l.widget_list[i]].hide_instance(target)};
	}
	
	lm.click = function (e, instance) {
		e.stopPropagation();
		if (game.world.selected === instance) game.world.select();
		else game.world.select(instance);
	}
	
	lm.new_production = function (target, name, f) {
		var l = getlm(target);
		if (l.production[name]) return;
		l.production[name] = f;
		game.create_cvar(target, name+'_modifier', 1);
	}
	
	lm.get_type = function (tile) {
		var i, a = {}, c = 0, n = 0;
		for (i in game.landmark) {
			if (game.landmark[i].unlocked) {
				a[i] = game.landmark[i].chance;
				c += a[i];
			}
		}
		
		var r = HL.r() * c;
		
		for (i in a) {
			r -= a[i];
			if (r <= 0) return i;
		}
	}
		
	return lm
} ()

game.governances = function birth_governances () {
	
	var gov = game.new_widget({id: 'governances'});
	
	gov.set_values = function (g) {
		for (var i in g.base_values) {
			g[i] = g.base_values[i] + (g.level_bonus[i] ? g.level_bonus[i] * g.value : 0)
		}
	}
	
	return gov;
	
} ();

game.world = function birth_world () {
	
	var world = game.new_widget({id: 'world'});
	
	world.html = HL.new_html('div', false, 'world_map');
	game.junction.add_html(world.html, false, 'exploration', 'maps')
	
	world.tiles = [];
	
	world.resources = {};
	
	var rotation_matrices = [
		[[1,0],[0,1]],
		[[0,-1],[1,0]],
		[[-1,0],[0,-1]],
		[[0,1],[-1,0]]
	]
	
	var tile_quality = [0.001, 0.01, 0.05, 0.3, 1];
	
	game.create_cvar(world, 'discovery_quality');
	game.create_cvar(world, 'travel_loss', .88);
	
	function resize () {
		var s = Math.ceil(Math.sqrt(world.tiles.length))
		world.html_size = game.regions.junction.offsetWidth / 2 - 40;
		world.tile_size = Math.floor(100/s)-3;
		world.html.style.width = world.html_size + 'px';
		world.html.style.height = world.html_size + 'px';
		world.html.style.fontSize = world.html_size * .24/s;
		for (var i = 0; i < world.tiles.length; i++) world.draw_tile(world.tiles[i]);
	}
	
	function get_tile_position (n) {
		n++;
		var lower_square = Math.ceil(Math.sqrt(n)) - 1;
		var range = lower_square * 2 + 1;
		var position = n - Math.pow(lower_square, 2);
		return position < range / 2 ? {x: lower_square, y: position - 1} : {x: position - Math.ceil(range / 2), y: lower_square}
	}
	
	world.make_tile = function (args) {
		if (!args) args = {number: world.tiles.length};
		var tile = {
			number: args.number,
			position: args.position || get_tile_position(args.number),
			html: HL.new_html('div', world.html, 'map_tile'),
			empty_nonants: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			rotation: typeof(args.rotation) == 'number' ? args.rotation : HL.r(4),
			//image_name: 'map_image.png',
			marks: [],
			click_me: function (e) {
				e.stopPropagation();
				if (world.selected == tile) world.select();
				else world.select(tile);
			}
		}
		
		tile.html.addEventListener('click', tile.click_me);
		tile.html_background = HL.new_html('div', tile.html, 'map_image');
		
		//if (args.image_name) tile.html_background.style.backgroundImage = 'url(\'images/'+tile.image_name+'\'';
		if (args.marks) for (var i in args.marks) {
			world.make_mark(tile, args.marks[i]);
			if (args.marks[i].type = 'lens') tile.has_lens = true;
		}		
		
		world.tiles.push(tile);
		world.create_grid();
		resize();
	}
	
	world.make_mark = function (tile, args) {
		if (!args) args={};
		
		var i, mark = {
			tile: tile,
			type: args.type,
			nonant: args.nonant,
			ui: {
				click_me: function (e) {game.landmarks.click(e, mark);}
			}
		}
		
		if (!mark.type) mark.type = game.landmarks.get_type(tile);
		if (!mark.type) return;
		var p = game.landmark[mark.type];
		
		if (typeof(mark.nonant) != 'number') mark.nonant = HL.r(tile.empty_nonants);
		
		var k = tile.empty_nonants.indexOf(mark.nonant);
		if (k != -1) tile.empty_nonants.splice(k,1);
		
		mark.ui.html = HL.new_html('div', tile.html, 'interest');
		mark.ui.html_icon = HL.new_html('div', mark.ui.html, 'interest_icon', p.icon + '&#65038;');
		mark.ui.html_icon.addEventListener('click', mark.ui.click_me);
		world.set_mark_position(mark);
		
		for (i in p.instance_data) {
			if (typeof(args[i])!='undefined') mark[i]=args[i];
			else mark[i] = HL.c(p.instance_data[i]);
		}
		
		for (i in p.discover) game.unlock(p.discover[i], {by: p.id});
		
		tile.marks.push(mark);
		game.landmarks.add_child(p, mark);
	}
	
	world.get_tile_save = function (tile) {
		var i, r = {
			number: tile.number,
			position: tile.position,
			rotation: tile.rotation,
			//image_name: tile.image_name,
			marks: [],
		};
		for (i in tile.marks) r.marks.push(world.get_mark_save(tile.marks[i]));
		return r;
	}
	
	world.get_mark_save = function (mark) {
		var i, r = {};
		for (i in mark) {
			if (['ui', 'tile', 'adjacencies'].indexOf(i)==-1) r[i]=mark[i]
		}
		return r;
	}
	
	world.set_mark_position = function (mark) {
		var x = mark.nonant % 3 - 1, y = Math.floor(mark.nonant/3)-1, r = mark.tile.rotation;
		mark.position = {};
		mark.position.x = rotation_matrices[r][0][0] * x + rotation_matrices[r][0][1] * y;
		mark.position.y = rotation_matrices[r][1][0] * x + rotation_matrices[r][1][1] * y;
		mark.ui.html.style.left = (37 + mark.position.x * 32) + '%';
		mark.ui.html.style.top = (37 + mark.position.y * 32) + '%';
	}
	
	world.remove_mark = function (tile, n) {
		var mark = tile.marks[n];
		if (game.world.selected == mark) game.world.select();
		if (mark.ui.html.parentNode) mark.ui.html.parentNode.removeChild(mark.ui.html);
		tile.marks.splice(n, 1);
		game.landmarks.remove_child(mark.type, mark);
		world.expire_mark(mark);
		game.apply_mods(game.landmark[mark.type]);
	}
	
	world.expire_mark = function (mark) {
		mark.expired = true;
		for (var i in game.landmark[mark.type].flags) mark[i] = false;
		if (game.world.selected == mark) game.word.select(mark);
		world.create_grid();
	}
		
	world.discover_tile = function (tile) {
		tile.empty_nonants = [0, 1, 2, 3, 4, 5, 6, 7, 8];
		while (tile.marks.length) world.remove_mark(tile, 0);
		//tile.html_background.style.backgroundImage = 'url(\'images/'+tile.image_name+'\')';
		var r = HL.r() / (1 + world.discovery_quality + tile.number * .2);
		for (var i=0; i<tile_quality.length; i++) {
			r -= tile_quality[i];
			if (r < 0) break;
		}
		tile.landmarks = tile_quality.length - i;
		for (i = 0; i < tile.landmarks; i++) world.make_mark(tile);
		tile.discoveries = 0;
		world.create_grid();
	}
	
	world.show_panel = function () {
		world.panel.html.style.display = 'block';
	}
	
	world.hide_panel = function () {
		world.panel.html.style.display = 'none';
	}
	
	world.draw_tile = function (tile) {
		tile.html.style.width = world.tile_size + '%';
		tile.html.style.height = world.tile_size + '%';
		tile.html.style.left = (world.tile_size + 3) * tile.position.x + '%';
		tile.html.style.top = (world.tile_size + 3) * tile.position.y + '%';
		if (tile.rotation) HL.add_class(tile.html_background, 'map_image_rotate_' + tile.rotation);
		for (var i = 0; i < tile.marks.length; i++) world.set_mark_position(tile.marks[i]);
	}
	
	world.tile_at = function (x, y) {
		for (var i =0; i < world.tiles.length; i++) if (world.tiles[i].position.x == x && world.tiles[i].position.y == y) return world.tiles[i]
	}
	
	world.swap_tiles = function (tile1, tile2) {
		var x = tile2.position.x, y = tile2.position.y;
		tile2.position.x = tile1.position.x;
		tile2.position.y = tile2.position.y;
		tile1.position.x = x;
		tile2.position.y = y;
		world.draw_tile(tile1);
		world.draw_tile(tile2);
		world.create_grid();
	}
	
	world.rotate_tile = function (tile, r) {
		if (!r) return;
		tile.rotation = (tile.rotation + r) % 4;
		world.draw_tile(tile);
		world.create_grid();
	}
	
	world.select = function (obj) {
		if (world.selected) {
			if (world.selected.ui) {
				HL.remove_class(world.selected.ui.html, 'interest_highlight');
				game.landmarks.hide(world.selected);
			} else {
				HL.remove_class(world.selected.html, 'map_tile_highlight');
				game.world.hide_panel();
			}
		}
		world.selected = obj;
		if (world.selected) {
			if (world.selected.ui) {
				HL.add_class(world.selected.ui.html, 'interest_highlight');
				game.landmarks.show(world.selected);
			}
			else {
				HL.add_class(world.selected.html, 'map_tile_highlight');
				if (world.selected.number>0) game.world.show_panel();
				world.set_expedition_cost();
			}
		}
	}
	
	world.set_expedition_cost = function () {
		if (!world.selected) world.expedition_cost = {};
		else world.expedition_cost = {} // FIX THIS;
		game.compute_cvar('expedite', 'cost');
	}
	
	world.panel = {
		title: 'Exploration',
		html_title: HL.new_html('div', false, 'expander_title', 'Exploration'),
		unlocked: true
	};
	
	game.create_expander(world.panel, {no_contract: true});
	game.junction.add_html(world.panel.html, true, 'exploration', 'exploration');
	world.panel.ui.add(world.panel.html_title, 'head');
	
	world.create_grid = function () {
		world.grid = {};
		if (!game.landmark.lens.children[0]) return;
		var i, ii, iii, mx, my, tx, ty, a, lx, ly;
		lx = game.landmark.lens.children[0].position.x * 3 + 1;
		ly = game.landmark.lens.children[0].position.y * 3 + 1;
		
		for (i in world.tiles) {
			for (ii in world.tiles[i].marks) {
				mx = world.tiles[i].position.x * 3 + world.tiles[i].marks[ii].position.x + 1;
				my = world.tiles[i].position.y * 3 + world.tiles[i].marks[ii].position.y + 1;
				if (!world.grid[mx]) world.grid[mx] = {};
				world.grid[mx][my] = world.tiles[i].marks[ii];
				world.tiles[i].marks[ii].lens_distance = ((mx-lx)**2 + (my-ly)**2)**.5;
			}
		}
		for (i in world.tiles) {
			for (ii in world.tiles[i].marks) {
				world.tiles[i].marks[ii].adjacencies = {};
				mx = world.tiles[i].position.x * 3 + world.tiles[i].marks[ii].position.x + 1;
				my = world.tiles[i].position.y * 3 + world.tiles[i].marks[ii].position.y + 1;
				for (iii = 0; iii<9; iii++) {
					if (iii!=4) {
						tx = mx + (iii % 3) - 1;
						ty = my + Math.floor(iii / 3) - 1;
						a = world.grid[tx] && world.grid[tx][ty];
						if (a&&!a.expired) {
							if (!world.tiles[i].marks[ii].adjacencies[a.type]) world.tiles[i].marks[ii].adjacencies[a.type] = 1;
							else world.tiles[i].marks[ii].adjacencies[a.type]++;
						}
					}
				}
			}
		}
	}
		
	world.epoch = function () {
		if (!world.unlocked) return;
		var yield = {}, m;
		for (var i in game.landmark) {
			for (var j in game.landmark[i].production) {
				if (!yield[j]) yield[j]=0;
				m = 0;
				for (var k in game.landmark[i].children) {
					m += game.landmark[i].production[j](game.landmark[i].children[k]) * world.travel_loss ** (game.landmark[i].children[k].lens_distance-1)
				}
				yield[j] += m * game.landmark[i][j+'_modifier'];
			}
		}
		var a = game.resources.award(yield, true);
		if (a!='Nothing') game.log.add('A new era begins, your followers collect riches from the world: ' + a);
	}
	game.each_aut.push(world.epoch);
	
	world.make_starting_tile = function () {
		world.make_tile({number: 0, rotation: 0, marks: [
			{type: 'wilds', nonant: 1},
			{type: 'lens', nonant: 4},
			{type: 'mine', nonant: 5}
		]});
	}
		
	world.clear = function () {
		while (world.tiles.length) {
			while (world.tiles[0].marks.length) world.remove_mark(world.tiles[0], 0);
			world.html.removeChild(world.tiles[0].html);
			world.tiles.shift();
		}
		world.create_grid();
	}
		
	world.unlock = function () {
		game.junction.unlock('exploration');
		world.unlocked = 1;
	}
	
	world.save = function () {
		var i, r = [[]];
		for (i in world.tiles) r[0].push(world.get_tile_save(world.tiles[i]));
		return r;
	}
	
	world.load = function (load_arr) {
		world.clear();
		for (var i in load_arr[0]) world.make_tile(load_arr[0][i])
		game.do_event(world, 'on_load');
	}

	return world
	
} ()

game.minery = function birth_mining() {
	var m = game.new_widget({id: 'minery'});
	
	m.html = HL.new_html('div');
	m.html_instance = HL.new_html('div', m.html, 'hidden');
	game.junction.add_html(m.html, false, 'exploration', 'mining');
	
	var set_mining_cost = game.create_mod(m, 'dig_mine', 'cost', function (x) {return m.current_cost}, 100);
	var set_mining_time = game.create_mod(m, 'dig_mine', 'time', function (x) {return m.current_time}, 100);
	
	m.unlock = function () {
		game.junction.unlock('exploration', 'mining');
	}
	
	m.show_instance = function (mine) {
		m.html_instance.innerHTML = mine.depth ? 'Mine Depth: ' + mine.depth + ' aud': '';
		m.current_cost = {labour: HL.r(15)+5};
		m.current_time = 0.05;
		game.apply_mod(set_mining_cost);
		game.apply_mod(set_mining_time);
		m.html_instance.style.display = 'block';
	}
	
	m.hide_instance = function () {
		m.current_cost = {};
		m.current_time = 0;
		game.apply_mod(set_mining_cost);
		game.apply_mod(set_mining_time);
		m.html_instance.style.display = 'none';
	}
	
	return m
} ()
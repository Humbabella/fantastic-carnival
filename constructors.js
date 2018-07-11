game.constructors = {

	/*deity: function (args, id) {
		args.id = id;
		args.no_contract = true;
		args.show_in = {tab: 'heavens', section: 'deities'}
		var d = game.new_constituent(args);
		
		d.description= args.description;
		d.effect_text= args.effect_text;
		d.sign_name= args.sign_name;
		d.sign_icon= args.sign_icon;
		d.sign_tooltip= args.sign_tooltip;
		d.signs= [];
		d.calendar_html= HL.new_html('div', game.starchart.html_log, 'active_star_line', args.sign_name);
		d.chance= args.chance;
		d.ascension = 0;
		
		d.unlock = function () {
		}
		
		d.save = function () {
		}
		
		d.load = function () {
		}
		
		//for (var i in args.mods) d.mods.push(game.create_mod(d, args.mods[i].id, args.mods[i].name, args.mods[i].func, args.mods[i].order));
		
		function show_sign_tooltip (e) {
			game.tooltip.show(e, d.sign_tooltip, d.sign_name);
		}
		
		d.calendar_html.addEventListener('mouseover', show_sign_tooltip);
		d.calendar_html.addEventListener('mouseout', game.tooltip.hide);

		return d;
		
	},*/
	
	deity: function (args, id) {
		args.id = id;
		args.show_in = {tab: 'heavens', section: 'deities'};
		var d = game.new_constituent(args);
		
		d.effect_text = args.effect_text;
		d.sign_name = args.sign_name;
		d.sign_icon = args.sign_icon;
		d.sign_tooltip = args.sign_tooltip;
		d.calendar_html = HL.new_html('div', game.pantheon.html_log, 'active_star_line', args.sign_icon + ' ' + args
		.sign_name);
		d.next_html = HL.new_html('div', false, 'expander_header_append');
		d.ascension = 0;
		
		game.create_cvar(d, 'delay', args.delay || 1);
		
		d.ui.add(d.next_html, 'head');
		
		game.pantheon.set_next(d);
		game.pantheon.draw_next(d);
				
		d.unlock = function () {
			d.html.style.display = 'block';
		};
		if (args.unlocked) d.unlock();
		
		d.save = function () {};
		
		d.load = function () {};
		
		function show_sign_tooltip(e) {
			game.tooltip.show(e, d.sign_tooltip, d.sign_name);
		}
		
		d.calendar_html.addEventListener('mouseover', show_sign_tooltip);
		d.calendar_html.addEventListener('mouseout', game.tooltip.hide);
		
		return d;
	},
	
	omen: function (args, id) {
		var o = {
			id: id,
			title: args.title,
			description: args.description,
			mods: [],
			apply: args.apply,
			duration: args.duration,
			icon: args.icon,
			condition: args.condition,
			chance: args.chance || 1
		}
		
		for (var i in args.mods) o.mods.push(game.create_mod(o, args.mods[i].id, args.mods[i].name, args.mods[i].func, args.mods[i].order));
		
		return o;
	},
	
	tech: function  (args, id) {
		args.id = id;
		args.buy_word = 'Impart Knowledge';
		args.disabled = game.research.is_working;
		args.trigger_button = true;
		
		var t = game.new_constituent(args);
		t.fixed_cost = args.fixed_cost;
		t.basic = args.basic;
		t.age = args.age;
		t.no_knowledge = args.no_knowledge;
		
		t.html_time = HL.new_html('div', false, 'expander_cost');
		t.ui.add(t.html_time, 'body', 1);
		t.html_time.update = function () {game.research.draw_time(t);}
		
		game.create_cvar(t, 'time', args.time || 1);
		game.create_cvar(t, 'cost', args.cost);
		
		var cost_adjustment = game.create_mod(t, id, 'cost', game.research.inflate_cost, 700);
		var time_adjustment = game.create_mod(t, id, 'time', game.research.inflate_time, 700);
		game.apply_mod(cost_adjustment);
		game.apply_mod(time_adjustment);
		
		t.html_cost = HL.new_html('div', false, 'expander_cost');
		t.ui.add(t.html_cost, 'body', 0);
		t.html_cost.update = function () {
			t.html_cost.innerHTML = 'Total Cost: ' + game.resources.consider({cost: t.cost}).format;
		}
		
		t.trigger = function () {
			game.research.set(t);
		}
		
		t.unlock = function () {
			t.html.style.display = 'block';
			game.compute_cvar(id, 'cost');
			game.compute_cvar(id, 'time');
			game.junction.unlock(t.show_in.tab, t.show_in.section);
		}
		
		t.save = function () {
			return [t.unlocked, t.complete]
		}
		
		t.load = function (load_arr) {
			if (load_arr[0]) game.unlock(t);
			if (load_arr[1]) game.research.complete(t);
		}
		
		return t;

	},
	
	project: function (args, id) {
		var p;
		args.id = id;
		args.buy_word = 'Enact';
		args.disabled = function () {return (!game.world.selected)||game.projects.is_working()||args.disable_if(p)}
		args.trigger_button = true;
		
		p = game.new_constituent(args);
		p.cant_do = args.cant_do;
		
		p.html_time = HL.new_html('div', false, 'expander_cost');
		p.ui.add(p.html_time, 'body', 1);
		p.html_time.update = function () {if (p.time>0) game.projects.draw_time(p); else p.html_time.innerHTML = ""};
		
		game.create_cvar(p, 'time', args.time || 1);
		game.create_cvar(p, 'cost', args.cost || {});
		
		p.html_cost = HL.new_html('div', false, 'expander_cost');
		p.ui.add(p.html_cost, 'body', 0);
		p.html_cost.update = function () {
			var c = game.resources.consider ({cost: p.cost});
			p.html_cost.innerHTML = 'Total Cost: ' + (c.format === 'Nothing' ? p.cant_do : c.format);
		}
		
		p.trigger = function () {
			p.target = game.world.selected;
			game.projects.set(p);
		}
		
		p.unlock = function () {
			p.html.style.display = 'block';
			game.junction.unlock(args.show_in.tab, args.show_in.section);
			game.compute_cvar(id, 'cost');
			game.compute_cvar(id, 'time');
		}
		
		p.save = function () {
			return [p.unlocked, p.target ? (p.target.type ? {tile: p.target.tile.number, nonant: p.target.nonant} : target.number) : false]
		}
		
		p.load = function (load_arr) {
			if (load_arr[0]) game.unlock(p);
			if (load_arr[1]) {
				if (typeof(load_arr[1])==='number') p.target === game.world.tiles[load_arr[1]];
				else {
					var t = game.world.tiles[load_arr[1].tile];
					for (var i in t.marks) if (t.marks[i].nonant === load_arr[1].nonant) p.target = t.marks[i];
				}
			}
		}
		
		return p;
	},
	
	science: function (args, id) {
		args.id = id;
		args.buy_word = 'Research';
		args.disabled = game.research.is_working;
		args.trigger_button = true;
		
		var sc = game.new_constituent(args);
		
		sc.value = 0;
		sc.html_value = HL.new_html('div', false, 'expander_header_append');
		sc.ui.add(sc.html_value, 'head');
		sc.time_function = args.time_function;
		
		sc.html_cost = HL.new_html('div', false, 'expander_cost');
		sc.ui.add(sc.html_cost, 'body', 0);
		sc.html_cost.update = function () {
			sc.html_cost.innerHTML = 'Total Cost: ' + game.resources.consider({cost: sc.cost}).format;
		}
		
		sc.html_time = HL.new_html('div', false, 'expander_cost');
		sc.ui.add(sc.html_time, 'body', 1);
		sc.html_time.update = function () {game.research.draw_time(sc)};
		
		game.create_cvar(sc, 'time');
		var base_time = game.create_mod(sc, id, 'time', function (x, me) {return me.time_function(me)}, 10);
		game.apply_mod(base_time);
		
		sc.trigger = function () {
			game.research.set(sc);
		}
		
		sc.unlock = function () {
			sc.html.style.display = 'block';
			game.compute_cvar(id, 'cost');
			game.compute_cvar(id, 'time');
			game.junction.unlock(sc.show_in.tab, sc.show_in.section);
		}
		
		sc.save = function () {
			return [sc.unlocked, sc.value];
		}
		
		sc.load = function (load_arr) {
			if (load_arr[0]) game.unlock(sc);
			if (load_arr[1]) game.research.complete(sc, load_arr[1]);
		}
		
		return sc;
	},
	
	vision: function (args, id) {
		args.id = id;
		args.buy_word = 'Behold';
		args.pay_button = true;
				
		var vis = game.new_constituent(args);
		
		vis.buy = function () {
			vis.complete = true;
			vis.html_button.style.display = 'none';
			vis.html_cost.style.display = 'none';
			vis.html_complete = HL.new_html('div', false, 'expander_header_append', ' (Complete)');
			vis.ui.add(vis.html_complete, 'head');			
			game.junction.add_html(vis.html, false, vis.show_in.tab, 'completed');
			game.junction.unlock(vis.show_in.tab, 'completed');
			game.do_update(vis);
		}
		
		vis.unlock = function () {
			vis.html.style.display = 'block';
			if (vis.show_in.tab) game.junction.unlock(vis.show_in.tab, vis.show_in.section)
		}
	
		vis.save = function () {
			return [vis.unlocked, vis.complete, vis.buy_object.paid, vis.buy_object.installments.made]
		}
		
		vis.load = function (load_arr) {
			if (load_arr[0]) game.unlock(vis);
			if (load_arr[1]) vis.buy();
			if (load_arr[2]) vis.buy_object.paid = load_arr[2];
			if (load_arr[3]) vis.buy_object.installments.made = load_arr[3];
		}
		
		return vis;
		
	},
	
	command: function (args, id) {
		args.id = id;
		args.trigger_button = true;
		
		var cmd = game.new_constituent(args);
		
		cmd.on = false;
		cmd.button_text = args.button_text;
		cmd.on_description = args.on_description;
		
		cmd.html_button_text.innerHTML = cmd.button_text[0];
				
		cmd.html_on_description = HL.new_html('div', false, 'expander_description', cmd.on_description)
		cmd.ui.add(cmd.html_on_description, 'body', 0)
		cmd.html_on_description.style.display = 'none';
		
		cmd.trigger = function () {
			cmd.set(cmd.on ? 0 : 1);
		}
				
		cmd.set = function (on) {
			cmd.on = on;
			cmd.html_button_text.innerHTML = cmd.button_text[on];
			cmd.html_on_description.style.display = cmd.on ? 'block' : 'none';
			game.apply_mods(cmd);
		}
		
		cmd.unlock = function () {
			cmd.html.style.display = 'block';
			if (cmd.show_in.tab) game.junction.unlock(cmd.show_in.tab, cmd.show_in.section);
		}
		
		cmd.save = function () {
			return [cmd.unlocked, cmd.on]
		}
		
		cmd.load = function (load_arr) {
			if (load_arr[0]) game.unlock(cmd);
			if (load_arr[1]) cmd.set(1);
		}
		
		return cmd
	},
	
	work: function (args, id) {
		args.id = id;
		args.pay_button = true;
		if (!args.buy_word) args.buy_word = 'Build';
		
		var w = game.new_constituent(args);
		
		if (args.max_value) w.max_value = args.max_value;
		
		w.value = 0;
		w.upgrades = {};
		
		w.html_value = HL.new_html('div', false, 'expander_header_append');
		w.html_value.update = function () {
			for (i in w.upgrades) if (w.upgrades[i].unlocked&&!w.upgrades[i].complete&&w.value) return w.html_value.innerHTML = ' (Upgradable)';
			if (w.max_value && w.value>=w.max_value) return w.html_value.innerHTML = ' (Complete)';
			if (w.value>0) return w.html_value.innerHTML = ' (' + w.value + ')';
			return w.html_value.innerHTML = '';
		}
		w.ui.add(w.html_value, 'head');
		
		w.html_upgrades = HL.new_html('div', false, 'expander_upgrades');
		w.ui.add(w.html_upgrades);
				
		w.buy = function (l) {
			if (typeof(l)!='number') l = w.value + 1;
			w.value = l;
			w.buy_object.paid = {};
			game.do_update(w);
			game.compute_cvar(w.id, 'cost')
			if (w.max_value && w.value >= w.max_value) {
				w.complete = true;
				w.html_button.style.display = 'none';
				w.html_cost.style.display = 'none';
			}
			w.html_upgrades.style.display = 'block';
		}
		
		game.add_event(w, 'mouseover', function () {HL.remove_class(w.html_title, 'expander_title_alert')}, 100);
		
		w.unlock = function () {
			if (!args.hidden) {
				w.html.style.display = 'block';
				if (w.show_in.tab) game.junction.unlock(w.show_in.tab, w.show_in.section);
			}
		}
		
		w.save = function () {
			return [w.unlocked, w.value, w.buy_object.paid, w.buy_object.installments.made]
		}
		
		w.load = function (load_arr) {
			if (load_arr[0]) game.unlock(w);
			if (load_arr[1]) w.buy(load_arr[1]);
			if (load_arr[2]) w.buy_object.paid = load_arr[2];
			if (load_arr[3]) w.buy_object.installments.made = load_arr[3];
		}
		
		return w;
	}, 
	
	governance: function (args, id) {
			
		args.show_in = {tab: 'social', section: 'philosophy'};
		args.buy_word = 'Advance';
		var gov = game.constructors.work(args, id);
		
		gov.base_values = {prosperity: args.prosperity, science: args.science, currency: args.currency, control: args.control, trade: args.trade, culture: args.culture},
		gov.level_bonus = args.level_bonus || {},
		
		gov.buy = function (l) {
			if (!l) l = gov.value + 1;
			gov.value = l;
			gov.html_value.innerHTML = ' (' + gov.value + ')';
			gov.buy_object.paid = {};
			game.do_update(gov);
			game.compute_cvar(gov.id, 'cost');
			game.governances.set_values(gov);
		}
		
		game.governances.set_values(gov);
		
		return gov;
		
	},
	
	landmark: function (args, id) {
		var lm = {
			id: id,
			title: args.title,
			chance: args.chance,
			icon: args.icon,
			instance_data: args.instance_data,
			description: args.description,
			unique: args.unique,
			production: {},
			widget_list: args.widget_list || []
		}
		
		for (var i in args.production) game.landmarks.new_production(lm, i, args.production[i]);
		
		lm.children = [];
		
		lm.unlock = function () {lm.unlocked = true};
		return lm
	},
	
	timer: function (args, id) {
		var i, timer = {
			id: id,
			value: 0
		}
		
		for (i in args.cvars) game.create_cvar(timer, i, args.cvars[i]);
		
		for (i in args.mods) timer.mods.push(game.create_mod(timer, args.mods[i].id, args.mods[i].name, args.mods[i].func, args.mods[i].order));
		
		for (i in args.events) for (var j in args.events[i]) game.add_event(timer, i, args.events[i][j].f, args.events[i][j].o);
		
		game.create_cvar(timer, 'max', args.base_max);
		game.create_cvar(timer, 'up_tick');
		
		function adjust_for_aut (x) {return x * game.clock.tick_amount}
		var up_adjustment = game.create_mod(timer, id, 'up_tick', adjust_for_aut, 700);
		game.apply_mod(up_adjustment);
		
		timer.save = function () {return [timer.value]}
		timer.load = function (load_arr) {
			if (load_arr[0]) timer.value = load_arr[0];
		}
		
		return timer
		
	},
	
	resource: function (args, id) {
		
		var i, res = {
			id: id,
			format: args.format,
			format_tick: args.format_tick,
			no_max: args.no_max,
			table: args.table,
			fraction: 0,
			value: 0,
			total_gained: 0,
			total_lost: 0,
			sub_zero: 0,
			mods: [],
			unlocked: args.unlocked,
			hold: 0,
			tooltip: args.tooltip
		}
		
		for (i in args.mods) res.mods.push(game.create_mod(res, args.mods[i].id, args.mods[i].name, args.mods[i].func, args.mods[i].order));
		
		res.release_hold = function () {res.hold = 0}

		if (args.overflow) game.add_event(res, 'overflow', args.overflow, 500);
		else if (!res.no_max) {
			function default_overflow (args) {
				if (args.old_value > args.parent.max) args.value = Math.min(args.old_value, args.value);
				else {
					args.value = args.parent.max;
					args.parent.fraction = 0;
				}
			}
			game.add_event(res, 'overflow', default_overflow, 500);
		}
		
		for (i in args.events) {
			for (var j in args.events[i]) game.add_event(res, i, args.events[i][j].f, args.events[i][j].o);
		}
		
		if (res.on_tick) game.each_tick.push(res.on_tick);
	
		game.create_cvar(res, 'title', args.title);
		game.create_cvar(res, 'max', args.base_max);
		game.create_cvar(res, 'up_tick');
		game.create_cvar(res, 'down_tick');
		game.on_cvar_update(res, 'up_tick', res.release_hold);
		game.on_cvar_update(res, 'down_tick', res.release_hold);
		for (i in args.cvars) game.create_cvar(res, i, args.cvars[i]);
		
		function adjust_for_aut (x) {return x * game.clock.tick_amount}
		var up_adjustment = game.create_mod(res, id, 'up_tick', adjust_for_aut, 700);
		var down_adjustment = game.create_mod(res, id, 'down_tick', adjust_for_aut, 700);
		game.apply_mod(up_adjustment);
		game.apply_mod(down_adjustment);
		
		var floor_max = game.create_mod(res, id, 'max', Math.floor, 999)
		game.apply_mod(floor_max);		
		
		res.html = HL.new_html('tr', game.resource_table[res.table], 'resource');
		res.html_title = HL.new_html('td', res.html, 'resource_name', res.title);
		game.on_cvar_update(id, 'title', function (args) {game.morph_text(res.html_title, args.value)});
		res.html_value = HL.new_html('td', res.html, 'resource_current', '0');
		res.html_max = HL.new_html('td', res.html, 'resource_max', res.max ? ' / ' + Math.floor(res.max) : '');
		res.html_tick = HL.new_html('td', res.html, 'resource_tick');
	
		game.on_cvar_update(id, 'max', function () {game.resources.draw_max(res)});
		game.on_cvar_update(id, 'up_tick', function () {game.resources.draw_tick(res)});
		game.on_cvar_update(id, 'down_tick', function () {game.resources.draw_tick(res)});
		
		function show_tooltip (e) {
			if (res.tooltip) game.tooltip.show(e, res.tooltip, res.title)
		}
	
		res.html.addEventListener('mouseover', show_tooltip);
		res.html.addEventListener('mouseout', game.tooltip.hide);
				
		res.unlock = function () {res.html.style.display = 'table-row'}
		res.save = function () {return [res.unlocked, res.value, res.fraction, res.total_gained, res.total_lost, res.sub_zero]}
		res.load = function (load_arr) {
			if (load_arr[0]) game.unlock(res);
			game.resources.set(res, load_arr[1]);
			res.fraction = load_arr[2];
			res.total_gained = load_arr[3];
			res.total_lost = load_arr[4];
			res.sub_zero = load_arr[5];
		}
		
		if (args.construct) args.construct(res);
		game.apply_mods(res);
		
		return res;
	
	},
	
	store: function (args, id) {
		
		var i, store = {
			id: id,
			stores: args.stores,
			cost: {cost: args.cost},
			sell: {cost: args.sell},
			value: 0
		}
		
		function apply_mods () {game.apply_mods(store)}
		
		game.create_cvar(store, 'effect', args.effect);
		game.on_cvar_update(id, 'effect', apply_mods);
		game.create_cvar(store, 'title', args.title);
		game.on_cvar_update(id, 'title', function (args) {game.morph_text(store.html_title, args.value)})
		
		store.mods = [
			game.create_mod(store, args.stores, 'max', function (x) {return x + store.effect * store.value}, 400),
			game.create_mod(store, 'warehouse', 'value', function (x) {return x + store.value}, 400)
		]
		
		store.html = HL.new_html('tr', game.resource_table[3], 'resource');
		store.html_title = HL.new_html('td', store.html, 'resource_name', store.title);
		store.html_value = HL.new_html('td', store.html, 'resource_current');
		store.html_plus = HL.new_html('td', store.html, 'table_button', '+');
		store.html_minus = HL.new_html('td', store.html, 'table_button', '-');
		
		game.add_button_animation(store.html_plus);
		game.add_button_animation(store.html_minus);
		
		store.draw_value = function () {store.node_value.innerHTML = store.value}
		
		store.click_plus = function (e) {
			store.html_plus.animate();
			if (game.warehouse.is_full()) return;
			var c = game.resources.consider(store.cost);
			if (c.cant_pay) return;
			c.pay();
			store.cost.paid = {};
			game.warehouse.allocate(store)
		}
		store.click_minus = function (e) {
			store.html_plus.animate();
			if (store.value==0) return;
			var c = game.resources.consider(store.sell);
			if (c.cant_pay) return;
			c.pay();
			store.sell.paid = {};
			game.warehouse.allocate(store, -1);
		}
		
		store.plus_tooltip = function (e) {
			var t = 'Cost: ' + game.resources.consider(store.cost).format + '<br>';
			t += 'Allocate space in store for ' + game.ids[store.stores].title + '.';
			game.tooltip.show(e, t, 'Build ' + store.title);
		}
		store.minus_tooltip = function (e) {
			var t = 'Cost: ' + game.resources.consider(store.sell).format + '<br>';
			t += 'Deallocate space in stores for ' + game.ids[store.stores].title + ', freeing space for other resources.';
			game.tooltip.show(e, t, 'Remove ' + store.title);
		}
		
		store.unlock = function () {
			store.html.style.display = 'table-row';
		}
		
		store.html_plus.addEventListener('click', store.click_plus);
		store.html_minus.addEventListener('click', store.click_minus);
		store.html_plus.addEventListener('mouseover', store.plus_tooltip);
		store.html_minus.addEventListener('mouseover', store.minus_tooltip);
		store.html_plus.addEventListener('mouseout', game.tooltip.hide);
		store.html_minus.addEventListener('mouseout', game.tooltip.hide);
		
		store.save = function () {return [store.unlocked, store.value]}
		store.load = function (load_arr) {
			if (load_arr[0]) store.unlock();
			if (load_arr[1]) game.warehouse.allocate(store, load_arr[1]);
		}
	
		return store
	},
	
	act: function (args, id) {
		
		var i, act = {
			id: id, 
			active: args.active,
			description: args.description,
			show_in: args.show_in,
			result: args.result,
			html: HL.new_html('div', false, 'act'),
			cooling: args.cooldown,
			buy_object: {cost: HL.d(args.cost)}
		}
		
		var base_cooldown = args.cooldown;
		game.create_cvar(act, 'cooldown', 0);
		game.create_cvar(act, 'title', args.title);
		game.create_cvar(act, 'cost', HL.d(args.cost));
		game.on_cvar_update(id, 'title', function (args) {game.morph_text(act.html_title, args.value)});
		game.on_cvar_update(id, 'cost', function (args) {act.buy_object = {cost: args.value}});
		
		act.mods = [
			game.create_mod(act, id, 'cooldown', function (x) {return base_cooldown}, 10)
		];
		
		for (i in args.cvars) game.create_cvar(act, i, args.cvars[i]);
		
		Object.defineProperty(act, 'base_cooldown', {
			get: function () {return base_cooldown},
			set: function (v) {base_cooldown = v; game.apply_mods(act);}
		})
		
		act.html.update = function () {
			if (act.cooling < act.cooldown) {
				HL.add_class(act.html_title, 'grey_out');
				act.html_fill.style.left = (act.cooling / act.cooldown * 100) + '%';
			} else {
				if (act.active && !act.active()) HL.add_class(act.html_title, 'grey_out');
				else HL.remove_class(act.html_title, 'grey_out');
				act.html_fill.style.left = '100%'
			}
		}
		
		act.html_outline = HL.new_html('div', act.html, 'act_outline');
		act.html_fill = HL.new_html('div', act.html_outline, 'act_fill');
		act.html_title = HL.new_html('div', act.html_outline, 'act_title', act.title);
		
		game.add_button_animation(act.html_outline);
		
		act.click_me = function (e) {
			var c = game.resources.consider(act.buy_object);
			if (act.cooling<act.cooldown || (act.active && !act.active()) || c.cant_pay) return;
			c.pay();
			act.buy_object.paid = {};
			act.html_outline.animate();
			act.cooling = 0;
			act.result(act);
			game.do_event(act, 'activate');
		}
		
		act.tooltip = function () {
			var c = game.resources.consider(act.buy_object);
			return (c.format != 'Nothing' ? 'Cost: ' + c.format + '<br>' : '') + HL.c(act.description, act);
		}
		
		act.show_tooltip = function (e) {
			if (act.tooltip) game.tooltip.show(e, act.tooltip, act.title);
		}
		
		act.html.addEventListener('click', act.click_me);
		act.html.addEventListener('mouseover', act.show_tooltip);
		act.html.addEventListener('mouseout', game.tooltip.hide);
		
		act.unlock = function () {
			if (act.unlocked) return;
			if (act.show_in.add_to) {
				var t = game.ids;
				for (var i = 0; i < act.show_in.add_to.length; i++) {
					t = t[act.show_in.add_to[i]]
				}
				t.ui.add(act.html);
			}
			if (act.show_in.tab) {
				game.junction.add_html(act.html, true, act.show_in.tab, act.show_in.section);
				game.junction.unlock(act.show_in.tab, act.show_in.section);
			}
			else if (act.show_in.id) game.ids[act.show_in.id].add(act.html);
		}
		
		act.save = function () {return [act.unlocked, act.base_cooldown, act.cooling]}
		act.load = function (load_arr) {
			if (load_arr[0]) game.unlock(id);
			if (load_arr[1]) act.base_cooldown = load_arr[1];
			if (load_arr[2]) act.cooling = load_arr[2];
		}
		
		game.apply_mods(act);
		return act;
		
	},
	
	job: function (args, id) {
		
		args.id = id;
		args.cost_function = game.jobs.level_cost;
		args.buy_word = 'Develop';
		args.show_in = {tab: 'social', section: 'professions'}
		
		var job = game.new_constituent(args);
		
		job.species = [];
		job.experience = 0;
		job.level = 0;
		job.generates = [];
		
		for (i in args.generates) game.jobs.generate_resource(job, i, args.generates[i]);
				
		job.update_efficiency_info = function () {
			job.html_count.innerHTML = 'Worker Count: ' + job.raw_count;
			job.html_efficiency.innerHTML = job.raw_count ? 'Worker efficiency: ' + (Math.round(job.count / job.raw_count *100)) + '%' : '';
		}
				
		game.create_cvar(job, 'raw_count', 0);
		game.create_cvar(job, 'count', 0);
		game.create_cvar(job, 'efficiency_bonus', 0);
		game.on_cvar_update(id, 'raw_count', function (args) {job.update_efficiency_info()});
		game.on_cvar_update(id, 'count', function () {game.apply_mods(job); job.update_efficiency_info()});
		game.on_cvar_update(id, 'title', function (args) {for (var i in job.species) game.morph_text(job.species[i].jobs[id].html_title, args.value)});

		HL.add_class(job.html_title, 'expander_header_inline');
		job.html_level = HL.new_html('div', false, 'job_level expander_header_inline', '');
		job.html_count = HL.new_html('div', false, 'job_raw_count', 'Worker Count: 0');
		job.html_efficiency = HL.new_html('div', false, 'job_efficiency', 'Worker Efficiency: 100%')
		
		job.ui.add(job.html_level, 'head');
		job.ui.add(job.html_count, 'body', 1);
		job.ui.add(job.html_efficiency, 'body', 2);
		
		job.unlock = function () {
			job.html.style.display = 'block';
		}
		
		job.save = function () {
			return [job.level, job.experience]
		} //nothing to save yet
		job.load = function (load_arr) {
			if (typeof(load_arr[0])==='number') job.level = load_arr[0];
			if (typeof(load_arr[0])==='number') job.experience = load_arr[0];
		}
		
		return job;
	},
	
	specie: function (args, id) {
		
		var i, species = {
			id: id,
			food_type: args.food_type,
			overflow: args.overflow,
			jobs: args.jobs,
			default_job: args.default_job,
			html: HL.new_html('div', false, 'species'),
			html_resource: HL.new_html('div', game.resource_table[0], 'resource'),
			value: 0,
			starvation: 0,
			food_share: 0,
			mods: []
		}
				
		function apply_mods () {
			game.apply_mods(species);
		}
		
		for (i in args.cvars) {
			game.create_cvar(species, i, args.cvars[i]);
			game.on_cvar_update(id, 'title', apply_mods)
		}
		
		game.create_cvar(species, 'title', args.title);
		game.on_cvar_update(id, 'title', function (args) {game.morph_text(species.html_title, args.value)})
		
		species.html_title = HL.new_html('td', species.html_resource, 'resource_name', species.title);
		species.html_value = HL.new_html('td', species.html_resource, 'resource_current', '0');
		species.html_max = HL.new_html('td', species.html_resource, 'resource_max', species.max ? ' / ' + Math.floor(species.max) : '');
		species.table_header = HL.new_html('div', species.html, 'job_holder', '<div class="job_title"></div><div class="job_count">Current</div><div class="job_target">Desired</div>');
		species.table_header.style.display = 'block';
			
		game.junction.add_html(species.html, false, 'cult', id);
		
		game.create_cvar(species, 'max', 0);
		game.create_cvar(species, 'hunger', args.hunger);
		game.create_cvar(species, 'starve_message', args.starve_message);
		game.create_cvar(species, 'efficiency_bonus', 0);
		
		for (i in args.mods) {
			species.mods.push(game.create_mod(species, args.mods[i].id, args.mods[i].name, args.mods[i].func, args.mods[i].order))
		}
		
		var eating = game.create_mod(species, species.food_type, 'down_tick', function (x, me) {return x + me.hunger * me.value}, 400)
		species.mods.push(eating);
		
		function starve (args) {
			species.starvation += args.sub_zero * species.food_share;
			if (species.starvation > species.hunger / 6) {
				args = {value: 1};
				args = game.do_event(species, 'starve', args);
				game.species.adjust(id, 0, 0, 1);
				if (species.starve_message) game.log.add(species.starve_message);
				species.starvation -= species.hunger / 20;
			}
		}
		game.add_event('food', 'sub_zero', starve, 500);
				
		function recompute_efficiency() {
			for (i in species.jobs) game.compute_cvar(species.jobs[i].id, 'efficiency');
		}
		
		function post_assign_change () {
			game.species.redistribute(species);
			species.draw_jobs();
			apply_mods();
		}
		
		function cap_value () {
			if (species.value > species.max && species.overflow && game.time_moving) species.overflow(species, species.value, species.max);
		}
		
		species.compute_food_share = function () {
			species.food_share = species.value * species.hunger / game.ids[species.food_type].down_tick * game.clock.tick_amount;
		}
		game.on_cvar_update(species.food_type, 'down_tick', species.compute_food_share);
				
		species.draw_jobs = function () {
			var c_val, c_next, i;
			for (i in species.jobs) {
				species.jobs[i].html_count.innerHTML = species.jobs[i].count;
				species.jobs[i].html_target.innerHTML = species.jobs[i].target;
			}
		}
		
		function draw_max () {
			if (species.max) species.html_max.innerHTML = '/ ' + species.max;
		}
		
		function add_job (z) {
			var s = args.jobs[z], j = {
				id: species.id + '_' + z,
				count: 0,
				priority: s.priority || false,
				html: HL.new_html('div', species.html, 'job_holder'),
				base_efficiency: s.base_efficiency || 5,
				multiplier: s.multiplier || 1,
				level_efficiency: s.level_efficiency || 0,
				target: species.default_job === z ? 1 : 0
			}
			
			species.jobs[z] = j;
			
			j.html_title = HL.new_html('div', j.html, 'job_title', game.job[z].title)
			j.html_count = HL.new_html('div', j.html, 'job_count', '0');
			j.html_target = HL.new_html('div', j.html, 'job_target', j.target);
						
			game.create_cvar(j, 'efficiency', j.base_efficiency)
			
			if (game.job[z].species.indexOf(species)==-1) game.job[z].species.push(species);
			
			var add_level_efficiency = game.create_mod(species, j.id, 'efficiency', function efficiency_level_bonus (x, me) {return x + game.job[z].level * j.level_efficiency}, 400);
			game.apply_mod(add_level_efficiency);
						
			var finalize_efficiency = game.create_mod(species, j.id, 'efficiency', function final_efficiency (x, me) {return 1 - 1 / (x + species.efficiency_bonus)}, 1000);
			game.apply_mod(finalize_efficiency);
			
			j.count_mod = game.create_mod(species, z, 'count', function (x, me) {
				return x + j.count * j.multiplier * Math.pow(j.efficiency, j.count - 1)
			}, 400);
			j.raw_count_mod = game.create_mod(species, z, 'raw_count', function (x, me) {return x + j.count}, 400);
			species.mods.push(j.count_mod);
			species.mods.push(j.raw_count_mod);
			
			game.on_cvar_update(j.id, 'efficiency', function () {game.apply_mod(j.count_mod)})
			
			if (species.default_job == z) species.unlock_job(species.default_job);
		
			j.html_plus = HL.new_html('div', j.html, 'job_plus_button', '+');
			game.add_button_animation(j.html_plus);
			j.html_minus = HL.new_html('div', j.html, 'job_minus_button', '-');
			game.add_button_animation(j.html_minus);
			j.click_plus = function (e) {
				//var c = game.resources.consider({cost: {will: 1}});
				//if (c.cant_pay) return;
				//c.pay();
				j.html_plus.animate();
				n = e.shiftKey ? 5 : 1;
				if (n<=0) return;
				j.target += n;
				post_assign_change();
			}
			j.click_minus = function (e) {
				//var c = game.resources.consider({cost: {will: 1}});
				//if (c.cant_pay) return;
				//c.pay();
				j.html_plus.animate();
				n = Math.min(j.target, e.shiftKey ? 5 : 1);
				if (n<=0) return;
				j.target -= n;
				post_assign_change();
			}
			j.plus_message = function () {
				//var c = game.resources.consider({cost: {will: 1}});
				return /*c.format+'<br>*/'Assign '+species.title+' to the task of ' + game.job[z].title + '. They will follow your desires, but actual number that will perform any given task depends on the number that exist.'
			}
			j.minus_message = function () {
				//var c = game.resources.consider({cost: {will: 1}});
				return /*c.format+'<br>*/'Unassign '+species.title+' to the task of' + game.job[z].title + '. They will follow your desires, but actual number that will perform any given task depends on the number that exist.'
			}
			j.plus_tooltip = function (e) {
				game.tooltip.show(e, j.plus_message, 'Assign ' + game.job[z].title);
			}
			j.minus_tooltip = function (e) {
				game.tooltip.show(e, j.minus_message, 'Unassign ' + game.job[z].title);
			}
			j.html_plus.addEventListener('click', j.click_plus);
			j.html_minus.addEventListener('click', j.click_minus);
			j.html_plus.addEventListener('mouseover', j.plus_tooltip);
			j.html_minus.addEventListener('mouseover', j.minus_tooltip);
			j.html_plus.addEventListener('mouseout', game.tooltip.hide);
			j.html_minus.addEventListener('mouseout', game.tooltip.hide);
		}	

		species.unlock_job = function (job_id) {
			if (species.jobs[job_id]) {
				species.jobs[job_id].html.style.display = 'block';
				species.jobs[job_id].unlocked = true;
				game.job[job_id].unlock({by: species.id})
			}
		}
		
		species.unlock = function () {
			species.html_resource.style.display = 'table-row';
			game.junction.unlock('cult', species.id);
		}
		
		for (i in args.events) {
			for (var j in args.events[i]) game.add_event(species, i, args.events[i][j].f, args.events[i][j].o);
		}
		
		game.on_cvar_update(id, 'max', cap_value);
		game.on_cvar_update(id, 'max', draw_max);
		game.on_cvar_update(id, 'hunger', apply_mods);
		game.on_cvar_update(id, 'hunger', species.compute_food_share);
		game.on_cvar_update(id, 'efficiency_bonus', recompute_efficiency);
		game.on_cvar_update(id, 'efficiency_bonus', apply_mods);
		
		for (i in args.jobs) add_job(i);

		if (args.construct) args.construct(species);
		
		species.save = function () {
			var i, r = [{}, species.unlocked, species.value];
			for (i in species.jobs) {
				r[0][i] = [species.jobs[i].count, species.jobs[i].target]
			}
			return r;
		}
		species.load = function (load_arr) {
			for (var i in load_arr[0]) {
				species.jobs[i].count = load_arr[0][i][0];
				species.jobs[i].target = load_arr[0][i][1];
			}
			if (load_arr[1]) game.unlock(id);
			if (load_arr[2]) {
				species.value = load_arr[2];
				species.html_value.innerHTML = species.value;
				species.draw_jobs();
			}
		}
		
		return species
	},
	
	upgrade: function (args, id) {
		// don't add an upgrade to something that doesn't have an expander_cost
		
		var up = {
			id: id,
			title: args.title,
			host: args.host,
			cost: args.cost,
			description: args.description,
			apply: args.apply,
			mods: [],
			html: HL.new_html('div', false, 'upgrade_line')
		}
		
		for (var i in args.mods) up.mods.push(game.create_mod(up, args.mods[i].id, args.mods[i].name, args.mods[i].func, args.mods[i].order));
		
		var h = game.ids[up.host];
		
		up.html_title = HL.new_html('div', up.html, 'upgrade_title', up.title);
		up.html_buy = HL.new_html('div', up.html, 'upgrade_buy', 'Upgrade');
		
		game.add_button_animation(up.html_buy);
		
		up.click_buy = function () {
			var c= game.resources.consider({cost: up.cost});
			if (c.cant_pay) return;
			c.pay();
			up.buy();
		}
				
		up.buy = function () {
			up.complete = 1;
			up.html_buy.style.display = 'none';
			up.html_complete = HL.new_html('div', up.html, 'upgrade_complete', ' (Complete)');
			game.do_update(up);
			game.apply_mods(game.ids[up.host]);
		}
		
		up.tooltip = function () {
			var c = game.resources.consider({cost: up.cost});
			return (c.format != 'Nothing' ? 'Cost: ' + c.format + '<br>' : '') + up.description;
		}
		
		up.show_tooltip = function (e) {
			if (up.tooltip) game.tooltip.show(e, up.tooltip, up.title);
		}
		
		up.html_buy.addEventListener('click', up.click_buy);
		up.html_buy.addEventListener('mouseover', up.show_tooltip);
		up.html_buy.addEventListener('mouseout', game.tooltip.hide);
		
		up.unlock = function () {
			up.unlocked = 1;
			up.html.style.display = 'block';
		}
		
		up.save = function () {
			return [up.unlocked, up.complete]
		}
		
		up.load = function (load_arr) {
			if (load_arr[0]) game.unlock(up);
			if (load_arr[1]) up.buy();
		}
		
		if (!h.html_upgrades) {
			h.html_upgrades = HL.new_html('div', false, 'expander_upgrades');
			h.ui.add(h.html_upgrades);
		}
		
		h.upgrades[id] = up;
		h.html_upgrades.appendChild(up.html);
		
		if (args.unlocked) up.unlock();
		
		return up;
		
	}
	
}

for (var id in data.object_data) {
	var d = data.object_data[id];
	if (!game.constructors[d.object_type]) {
		console.log('failed to construct: ' + id);
	} else {
		if (!game[d.object_type]) game[d.object_type] = {};
		game.ids[id] = game.constructors[d.object_type](d, id);
		game[d.object_type][id] = game.ids[id];
		game.ids[id].object_type = d.object_type;
		if (d.unlocked) game.unlock(id);
	}
}
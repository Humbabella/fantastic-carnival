game = {
	ids: {},
	actions: {},
	each_tick: [],
	each_aut: [],
	create_event_handler: function create_action (parent, name) {
		var action = {
			parent: parent,
			name: name,
			results: [],
			order: []
		}
		if (!game.actions[name]) game.actions[name] = {};
		game.actions[name][parent.id] = action;
	},
	do_event: function (parent, name, args) {
		if (!game.actions[name] || !game.actions[name][parent.id]) return args;
		var i, args = HL.d(args), action = game.actions[name][parent.id];
		args.parent = parent;
		args.cancel_action = false;
		for (i = 0; i < action.results.length; i++) {
			action.results[i](args);
			if (args.cancel_action) return args;
		}
		return args;
	},
	add_event: function (parent, name, func, order) {
		var parent_id;
		if (typeof(parent)=='object') var parent_id = parent.id;
		else {
			parent_id = parent;
			parent = game.ids[parent];
		}
		
		if (!game.actions[name] || !game.actions[name][parent_id]) game.create_event_handler(parent, name);
		
		var i, action = game.actions[name][parent_id];
		if (!order) order = 500;
		for (i = 0; i < action.order.length; i++) {
			if (order < action.order[i]) {
				action.results.splice(i, 0, func);
				action.order.splice(i, 0, order);
				return;
			}
		}
		action.results.push(func);
		action.order.push(func);
	},
	remove_event: function (parent_id, name, func) {
		var i, action = game.actions[name][parent_id];
		var k = action.results.indexOf(func);
		if (k==-1) return;
		action.results.splice(k, 1);
		action.order.splice(k, 1);
	},
	cvars: {},
	update_all_cvars: function (args) {
		for (var i in game.cvars) for (var j in game.cvars[i]) game.compute_cvar(j, i, args);
	},
	create_cvar: function create_cvar (parent, name, initial_value) {
		var c = game.get_cvar(parent.id, name);
		
		var cvar = {
			initial_value: initial_value || 0,
			value: initial_value || 0,
			parent: parent,
			name: name,
			mods: [],
			on_compute: []
		}
		
		for (var i in c.mods) cvar.mods.push(c.mods[i]);
		for (i in c.on_compute) cvar.on_compute.push(c.on_compute[i]);
		
		Object.defineProperty(parent, name, {
			get: function get_cvar_value () {
				return cvar.value;
			}
		})
		
		if (!game.cvars[name]) game.cvars[name] = {};
		game.cvars[name][parent.id] = cvar;
	},
	get_cvar: function (id, name) {
		if (!game.cvars[name]) game.cvars[name] = {};
		if (typeof(id)!='string') id = id.id;
		if (!game.cvars[name][id]) return game.cvars[name][id] = {mods: [], on_compute: []};
		return game.cvars[name][id];
	},
	compute_cvar: function compute_cvar (id, name, args) {;
		var cvar = typeof(id)=='string' ? game.get_cvar(id, name) : id;
		if (id == 'labour' && name == 'down_tick') {
			var blah = 1;
		}
		var i, old_value = cvar.value, x = cvar.initial_value, debug = 'base: ' + cvar.initial_value + '; ';
		for (i=0; i<cvar.mods.length; i++) {
			if (typeof(cvar.mods[i].func) != 'function') {
				console.log('non-function: ' + cvar.parent + ', ' + cvar.id + ', ' + cvar.name)
			}
			if (!cvar.mods[i].disabled) x = cvar.mods[i].func(x, cvar.mods[i].parent, cvar.parent);
			debug += (cvar.mods[i].parent ? cvar.mods[i].parent.id : 'unknown') + ': ' + x + '; ';
		}
		cvar.value = x;
		cvar.debug = debug;
		if (!args) args = {};
		args.value = x;
		args.old_value = old_value;
		args.parent = cvar.parent;
	for (i=0; i<cvar.on_compute.length; i++) {cvar.on_compute[i](args)}
	},	
	create_mod: function create_mod (parent, id, name, func, order) {
		var mod = {
			parent: parent,
			name: name,
			func: func,
			order: order
		}
		if (typeof(id)==='string') mod.id = id;
		else mod.ids = id;
		return mod;
	},
	on_cvar_update: function on_cvar_update(id, name, func) {
		var cvar = game.get_cvar(id, name);
		cvar.on_compute.push(func);
	},
	apply_mod: function apply_mod (mod) {
		if (mod.id) {
			var cvar = game.get_cvar(mod.id, mod.name);
			if (cvar.mods.indexOf(mod)!=-1) {
				if (game.time_moving) game.compute_cvar(cvar);
				return;
			}
			for (var i=0; i<cvar.mods.length; i++) {
				if (mod.order < cvar.mods[i].order) {
					cvar.mods.splice(i, 0, mod);
					if (game.time_moving) game.compute_cvar(cvar);
					return;
				}
			}
			cvar.mods.push(mod);
			if (game.time_moving) game.compute_cvar(cvar);
		}
		if (mod.ids) {
			for (var i=0; i<mod.ids.length; i++) {
				var cvar = game.get_cvar(mod.ids[i], mod.name);
				if (cvar.mods.indexOf(mod)===-1) {
					for (var j=0; j<cvar.mods.length; j++) {
						if (mod.order < cvar.mods[j].order) {
							cvar.mods.splice(j, 0, mod);
							if (game.time_moving) game.compute_cvar(cvar);
						}
					}
					cvar.mods.push(mod);	
				}
				if (game.time_moving) game.compute_cvar(cvar);
			}
		}
	},
	remove_mod: function remove_mod(mod) {
		if (mod.id) {
			var cvar = game.get_cvar(mod.id, mod.name), k = cvar.mods.indexOf(mod);;
			if (k==-1) return;
			cvar.mods.splice(k, 1);
			game.compute_cvar(cvar);
		}
		if (mod.ids) {
			for (var i = 0; i<mod.ids.length; i++) {
				var cvar = game.get_cvar(mod.ids[i], mod.name), k = cvar.mods.indexOf(mod);;
				if (k==-1) return;
				cvar.mods.splice(k, 1);
				game.compute_cvar(cvar);
			}
		}
	},
	apply_mods: function apply_mods (obj) {
		if (typeof(obj)=='string') obj = game.ids[obj];
		for (var i in obj.mods) game.apply_mod(obj.mods[i]);
	},
	remove_mods: function remove_mods (obj) {
		if (typeof(obj)=='string') obj = game.ids[obj];
		for (var i in obj.mods) game.remove_mod(obj.mods[i]);
	},
	save_game: function () {
		var i, save_file = {};
		for (i in game.ids) if (game.ids[i].save) save_file[i] = game.ids[i].save();
		save_file = JSON.stringify(save_file)//.replace('"', '');
		console.log(save_file);
		localStorage.humbas_it_remake = save_file;
	},
	load_game: function (save_file) {
		var stop = game.time_moving;
		if (stop) game.clock.stop();
		if (!save_file) save_file = localStorage.humbas_it_remake;
		save_file = JSON.parse(save_file);
		for (i in save_file) game.ids[i].load(save_file[i]);
		if (stop) game.clock.start();
	},
	replace_save: function (x) {
		if (!x) delete localStorage.humabs_it_remake;
		else localSTorage.humbas_it_remake = x;
		location.reload();
	},
	unlock: function (id, args) {
		o = typeof(id)=='string' ? game.ids[id] : id;
		if (typeof(o)=='undefined') {
			console.log('to do: ' + id);
			return;
		}
		if (!args) args = {};
		if (!o.locks || args.all) {
			if (!o.unlock) {
				blach = 1;
			}
			o.unlock(); 
			o.unlocked = true;}
		if (!o.keys) o.keys = [];
		if (o.keys.indexOf(args.by)==-1) o.keys.push(args.by);
		if (o.keys.length >= o.locks) {
			o.unlock();
			o.unlocked = true;}
	},
	new_widget: function (args) {
		var r = {
			id: args.id
		}
		
		game.ids[r.id] = r;
		return r;
	},
	do_update: function (upgrade) {
		if (upgrade.apply) upgrade.apply(upgrade);
		for (var i in upgrade.unlocks) game.unlock(upgrade.unlocks[i], {by: upgrade.id});
		game.apply_mods(upgrade);
	},
	new_constituent: function (args) {
		var r = {
			id: args.id,
			show_in: args.show_in || {},
			cost_function: args.cost_function,
			locks: args.locks,
			apply: args.apply,
			mods: [],
			disabled: args.disabled,
			unlocks: args.unlocks
		}		
		
		for (i in args.mods) r.mods.push(game.create_mod(r, args.mods[i].id || args.mods[i].ids, args.mods[i].name, args.mods[i].func, args.mods[i].order));
				
		game.create_cvar(r, 'title', args.title);
		game.on_cvar_update(r.id, 'title', function (args) {if (args.value) game.morph_text(r.html_title, args.value)})
		if (args.description) {		
			game.create_cvar(r, 'description', args.description);
			game.on_cvar_update(r.id, 'description', function (args) {r.html_description.innerHTML = args.value});
		}
		
		game.create_expander(r, args);
		
		r.apply_mods = function () {
			game.apply_mods(r);
		}
		
		for (i in args.cvars) {
			game.create_cvar(r, i, args.cvars[i]);
			game.on_cvar_update(r.id, i, r.apply_mods)
		}
		
		r.html_title = HL.new_html('div', false, 'expander_title expander_header_inline', r.title);
		r.html_description = HL.new_html('div', false, 'expander_description', args.description);
		
		if (args.description_function) {
			r.description_function = args.description_function;
			r.html_description.update = function () {
				r.html_description.innerHTML = r.description_function(r);
			}
		}
		
		r.ui.add(r.html_title, 'head');
		r.ui.add(r.html_description);
		
		if (args.pay_button) {
			r.buy_object = {cost: args.cost, installments: {made: 0, max: args.installments}};
			if (args.substitutions) r.buy_object.substitutions = args.substitutions;
		
			game.create_cvar(r, 'cost', args.cost);
			game.on_cvar_update(id, 'cost', function (args) {r.buy_object.cost = args.value})
			if (r.cost_function) {
				var base_cost = game.create_mod(r, id, 'cost', function (x, me) {return me.cost_function(me)}, 10);
				game.apply_mod(base_cost);
			}
			game.create_cvar(r, 'installments', args.installments || 1);
			game.on_cvar_update(id, 'installments', function (args) {r.buy_object.installments.max = args.value})
			
			r.html_button = HL.new_html('div', false, 'expander_header_button');
			r.html_button_fill = HL.new_html('div', r.html_button, 'button_fill');
			r.html_button_text = HL.new_html('div', r.html_button, 'button_text', args.buy_word);
			game.add_button_animation(r.html_button);
			r.html_cost = HL.new_html('div', false, 'expander_cost', 'Cost: ' + game.resources.consider(r.buy_object).format);
			
			r.ui.add(r.html_button, 'head');
			r.ui.add(r.html_cost);
									
			r.html_button.update = function () {
				if (r.complete) return;
				var f = false;
				var c = game.resources.consider(r.buy_object);
				if (c.cant_pay || r.disabled && r.disabled()) HL.add_class(r.html_button, 'grey_out');
				else HL.remove_class(r.html_button, 'grey_out');
				r.html_cost.innerHTML = 'Cost: ' + c.format;
			}
			
			r.click_button = function (e) {
				if (r.complete || r.disabled && r.disabled()) return;
				var c = game.resources.consider(r.buy_object);
				if (c.cant_pay) return;
				r.html_button.animate();
				c.pay();
				if (c.is_paid) {
					r.buy_object.paid = {};
					if (r.buy_object.installments) r.buy_object.installments.made = 0;
					r.html_button_fill.style.left = '100%';
					r.buy();
				} else {
					r.html_button_fill.style.left = Math.floor(r.buy_object.installments.made / r.buy_object.installments.max * 100) + '%';
				}
			}
			
			r.html_button.addEventListener('click', r.click_button);
		}
		
		if (args.trigger_button) {
			r.html_button = HL.new_html('div', false, 'expander_header_button');
			r.html_button_fill = HL.new_html('div', r.html_button, 'button_fill');
			r.html_button_text = HL.new_html('div', r.html_button, 'button_text', args.buy_word);
			game.add_button_animation(r.html_button);
			
			r.disabled = args.disabled;
				
			r.html_button.update = function () {
				if (r.disabled && r.disabled()) HL.add_class(r.html_button, 'grey_out');
				else HL.remove_class(r.html_button, 'grey_out');
			}
			
			r.ui.add(r.html_button, 'head');
			
			r.click_me = function (e) {
				if (r.disabled && r.disabled()) return;
				r.html_button.animate();
				r.trigger(r)
			}
			
			r.html_button.addEventListener('click', r.click_me);
		}
		
		if (r.show_in.address) {
			var t = game.ids;
			for (var i = 0; i < r.show_in.address.length; i++) {
				t = t[r.show_in.address[i]]
			}
			t.appendChild(r.html);
		} else if (r.show_in.tab) {
			game.junction.add_html(r.html, true, r.show_in.tab, r.show_in.section);
		}
				
		if (args.construct) args.construct(r);
		
		return r;
	},
	new_project_manager: function (args) {
		var p = game.new_widget({id: args.id});
		
		p.show_in = args.show_in;
		
		p.html = HL.new_html('div');
		p.html_label = HL.new_html('div', p.html);
		p.html_details = HL.new_html('div', p.html);
		
		var resume_args = {
			id: 'resume_project',
			title: 'Project Suspended',
			trigger_button: true,
			description: 'Project was suspended because of a lack of resources. Resume project when resources are available.',
		}
		
		p.resume = game.new_constituent(resume_args);
		p.resume.html_button_text.innerHTML = 'Resume',
		p.resume.trigger = function () {
			p.resume.html.style.display = 'none';
			p.suspended = 0;
			p.start_paying();
		}
		
		p.html.appendChild(p.resume.html);
		
		game.create_cvar(p, 'effect', 1);
		
		p.payment_mods = {};
		p.suspend = function () {
			p.resume.html.style.display = 'block';
			p.suspended = 1;
			p.stop_paying();
		}
		
		p.apply_mod = function (mod_id) {
			if (!p.payment_mods[mod_id]) {
				p.payment_mods[mod_id] = game.create_mod(p, mod_id, 'down_tick', function (x) {return x + p.current_cost[mod_id] / p.max * p.effect}, 400);
			}
			game.apply_mod(p.payment_mods[mod_id]);
			game.add_event(mod_id, 'zero', p.suspend, 500);
		}
		
		p.start_paying = function () {
			for (var i in p.current_cost) p.apply_mod(i);
		}
		
		p.stop_paying = function () {
			for (var i in p.current_cost) {
				game.remove_mod(p.payment_mods[i]);
				game.remove_event(i, 'zero', p.suspend);
			}
		}
		
		p.update_mods = function () {
			for (var i in p.current_cost) game.compute_cvar(i, 'down_tick');
		}
		game.on_cvar_update(p, 'effect', p.update_mods);
		
		p.html.update = function () {
			p.html_label.innerHTML = 'Effectiveness: ' + Math.round(p.effect*100) + '%';
			if (p.current_project) {
				var j = p.progress / p.max * 100;
				p.current_project.html_button_fill.style.left = j + '%';
				p.current_project.html_button_text.innerHTML = Math.floor(j) + '%';
				p.html_details.innerHTML = 'Current ' + args.project_word + ': ' + p.current_project.title;
			}
		}
		game.junction.add_html(p.html, true, args.show_in.tab, args.show_in.section)
		
		p.draw_time = function (proj) {
			var t = (proj.time - (proj === p.current_project ? p.progress : 0)) / p.effect;
			if (t<.2) proj.html_time.innerHTML = 'This can be completed soon.';
			else {
				t -= 1 - game.clock.ticks_this_aut / game.clock.aut_length;
				proj.html_time.innerHTML = 'This can be completed ' + (t<=0 ? ' this epoch.' : (t<=1 ? 'next epoch.' : 'in ' + Math.ceil(t) + ' epochs.'));
			}
		}
		
		p.unlock = function () {
			p.unlocked = true;
			game.junction.unlock(p.show_in.tab);
		}
		
		p.is_working = function () {
			return (p.current_project) ? true : false;
		}
		
		p.set = function (new_project) {
			if (p.current_project) return;
			if (typeof(new_project)==='string') new_project = game.ids[new_project]
			p.current_project = new_project;
			p.current_cost = p.current_project.cost;
			p.max = p.current_project.time;
			p.progress = 0;
			p.start_paying();
			if (p.onset) p.onset(new_project)
		}

		p.tick = function () {
			if (!p.current_project || p.suspended) return;
			p.progress += p.effect * game.clock.tick_amount;
			if (p.progress >= p.max) {
				p.complete(p.current_project, 'auto');
				p.current_project = false;
			}
		}
		
		p.remain = function () {
			if (p.suspended) return 'Suspended';
			if (!p.current_project) return '-';
			return HL.t((p.max - p.progress)/(p.effect * game.clock.aut_length) * game.clock.time_adjustment);
		}
		
		game.each_tick.push(p.tick);
		
		p.save = function () {
			return [p.current_project ? p.current_project.id : 0, p.progress, p.current_cost, p.max, p.suspended]
		}
		
		p.load = function (load_arr) {
			if (load_arr[0]) p.set(load_arr[0]);
			if (load_arr[1]) p.progress = load_arr[1];
			if (load_arr[2]) {
				p.current_cost = load_arr[2];
				p.start_paying();
			}
			if (load_arr[3]) p.max = load_arr[3];
			if (load_arr[4]) p.suspend();
		}
		
		return p;
		
	}
}
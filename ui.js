game.regions = {
	junction: document.getElementById('left_column'),
	resources: document.getElementById('middle_column'),
	log: document.getElementById('right_column')
}

game.debug_window = document.getElementById('debug_window');

game.morph_text = function (html, new_text) {
	if (!game.time_moving  || html.style.display == 'none') return html.innerHTML = new_text;
	if (html.morpher) html.morpher.stop();
	html.morpher = {
		interval: false,
		stop: function () {clearInterval(html.morpher.interval)},
		new_text: new_text,
		old_text: html.innerHTML,
		length: Math.max(new_text.length, html.innerHTML.length),
		trans_text: [],
		trans_arr: [],
		trans_count: 0,
		morph: function () {
			var r = HL.r(html.morpher.length), t = '', m = html.morpher;
			if (m.trans_arr[r]==0) m.trans_arr[r] = 1;
			else if (m.trans_arr[r]==1) m.trans_arr[r] = 2;
			else if (m.trans_arr[r]==2) m.trans_arr[r] = HL.r()<.2 ? 1 : 2;
			for (var i = 0; i < m.length; i++) t += m.trans_arr[i] == 0 ? m.old_text[i] : (m.trans_arr[i] == 1 ? m.trans_text[i] : m.new_text[i]);
			m.trans_count++;
			if (html.innerHTML == m.new_text || m.trans_count >= m.length * 7) {
				if (!m.new_text.trim) {
					console.log('tried to morph to nothing:');
					console.log(html);
				}
				m.stop();
				t = m.new_text.trim();
			}
			html.innerHTML = t;
		}
	}
	for (var i = 0; i < html.morpher.length; i++) {
		html.morpher.trans_text.push(HL.r(game.greek_chars));
		html.morpher.trans_arr.push(0);
	}
	while (html.morpher.old_text.length < html.morpher.length) html.morpher.old_text += ' ';
	while (html.morpher.new_text.length < html.morpher.length) html.morpher.new_text += ' ';
	html.morpher.interval = setInterval(html.morpher.morph, 50);
}


game.add_button_animation = function (html) {
	
	function on_animate () {HL.add_class(html, 'rev_grad')}
	function on_finish () {HL.remove_class(html, 'rev_grad')}
	
	HL.add_class(html, 'grad_fill');
	html.animate = function () {
		on_animate();
		clearTimeout(html.animate_timer);
		html.animate_timer = setTimeout(on_finish, 150);
	}
}

game.tooltip = function spawn_tooltip () {
	var tooltip = {
		html: HL.new_html('div', game.regions.resources, 'tooltip')
	}
	
	tooltip.head = HL.new_html('div', tooltip.html, 'tooltip_heading');
	tooltip.body = HL.new_html('div', tooltip.html, 'tooltip_body');
	
	tooltip.show = function (e, t, h) {
		if (t) tooltip.current_text = t;
		if (!h) h = '';
		tooltip.head.innerHTML = HL.c(h);
		tooltip.body.innerHTML = HL.c(tooltip.current_text);
		if (e) {
			tooltip.html.style.display = 'block'
		}
	}
	
	tooltip.hide = function () {
		tooltip.html.style.display = 'none';
	}
	
	tooltip.update = function () {
		if (tooltip.html.style.display == 'block') tooltip.body.innerHTML = HL.c(tooltip.current_text);
	}
	
	game.each_tick.push(tooltip.update);
	
	return tooltip;
}();

game.junction = function spawn_junction () {
	var junction = {}
	
	junction.html = HL.new_html('div', game.regions.junction, 'junction');
	junction.html_head = HL.new_html('div', junction.html, 'junction_header');
	junction.html_content = HL.new_html('div', junction.html, 'junction_content');
	junction.html_body = [];
	junction.html_body.push(HL.new_html('div', junction.html_content, 'junction_body_left'));
	junction.html_body.push(HL.new_html('div', junction.html_content, 'junction_body_right'));
	
	junction.showing = [false, false];
	
	junction.add_html = function (html, updatable, tab, section_name) {
		if (typeof(tab)=='string') tab = game.tabs[tab];
		if (updatable) tab.updates.push(html);
		if (section_name) tab.sections[section_name].html_body.appendChild(html);
		else tab.html_body.appendChild(html);
	}
	
	junction.alert_tab = function (tab, value) {
		if (typeof(value)=='undefined') value = true;
		if (typeof(tab)=='string') tab = game.tabs[tab];
		if (value && junction.showing.indexOf(tab)==-1) HL.add_class(tab.html_head, 'tab_header_alert');
		else HL.remove_class(tab.html_head, 'tab_header_alert');
	}
	
	junction.highlight_tab = function (tab, value) {
		if (typeof(value)=='undefined') value = true;
		if (typeof(tab)=='string') tab = game.tabs[tab];
		if (value) HL.add_class(tab.html_head, 'tab_header_select');
		else HL.remove_class(tab.html_head, 'tab_header_select');
	}
	
	junction.collapse_section = function (section) {
		section.collapsed = !section.collapsed;
		section.html_body.style.display = section.collapsed ? 'none' : 'block';
		section.html_collapse_button.innerHTML = section.collapsed ? '+' : '-';
	}
	
	junction.unlock = function (tab, section_name) {
		if (typeof(tab)=='string') tab = game.tabs[tab];
		if (section_name) tab.sections[section_name].html.style.display = 'block';
		tab.html_head.style.display = 'inline-block';
	}
	
	junction.update_tab = function (tab) {
		if (typeof(tab)=='string') tab = game.tabs[tab];
		for (var i in tab.updates) {
			if (typeof(tab.updates[i].update)==='function')	tab.updates[i].update();
			else console.log('failed update: ' + tab.updates[i].innerHTML);
		}
	}
	
	junction.show_tab = function (tab, side) {
		var x = side ? 0 : 1;
		if (junction.showing[x]==tab) junction.showing[x] = false;
		if (junction.showing[side]) junction.highlight_tab(junction.showing[side], false);
		junction.html_body[side].innerHTML = '';
		junction.update_tab(tab);
		junction.html_body[side].appendChild(tab.html_body);
		junction.highlight_tab(tab, true);
		junction.alert_tab(tab, false);
		junction.showing[side] = tab;
	}
	
	junction.update = function () {
		for (var i in junction.showing) if (junction.showing[i]) junction.update_tab(junction.showing[i]);
	}
	
	game.each_tick.push(junction.update);
	return junction;
} ()

game.tabs = {};
game.create_tab = function create_tab (args) {
	var tab = {
		id: 'tab_' + args.name,
		name: args.name,
		sections: {},
		html_body: HL.new_html('div', 0, 'tab_body'),
		updates: [],
		click_me: function (e) {game.junction.show_tab(tab, e.shiftKey ? 1 : 0)},
		sections: {}
	}
	
	game.create_cvar(tab, 'title', args.title);
	game.on_cvar_update(tab.id, 'title', function (args) {game.morph_text(tab.html_head, args.value)})
	
	tab.html_head = HL.new_html('div', game.junction.html_head, 'tab_header', tab.title),
		
	tab.html_head.addEventListener('click', tab.click_me);
	if (args.show) tab.html_head.style.display = 'inline-block';
	for (i in args.sections) game.create_section(args.sections[i], tab);
	game.tabs[tab.name] = tab;
	game.ids[tab.id] = tab;
}

game.create_section = function create_section (args, tab) {
	var section = {
		name: args.name,
		title: args.title,
		html: HL.new_html('div', tab.html_body, 'section'),
		collapsed: false,
		collapse: function (e) {game.junction.collapse_section(section)}
	}
	section.html_head = HL.new_html('div', section.html, 'section_header');
	section.html_head_text = HL.new_html('div', section.html_head, '', section.title);
	section.html_body = HL.new_html('div', section.html, 'section_body');
	section.html_collapse_button = HL.new_html('div', section.html_head, 'section_collapse_button', '-')
	section.html_collapse_button.addEventListener('click', section.collapse);
	if (args.show) section.html.style.display = 'block';
	tab.sections[section.name] = section;
}

for (var i in data.tabs) game.create_tab(data.tabs[i]);

game.create_expander = function create_expander (parent, args) {
	if (!args) args = {};
	parent.html = HL.new_html('div', false, 'expander');
	parent.html_head = HL.new_html('div', parent.html, 'expander_head');
	parent.html_line = HL.new_html('div', parent.html, 'expander_line');
	parent.html_body = HL.new_html('div', parent.html, 'expander_body');
	parent.html_footer = HL.new_html('div', parent.html, 'expander_footer');
	parent.ui = {
		pinned: false,
		click_pin: function () {
			if (parent.ui.pinned) {
				parent.ui.pinned = false;
				parent.html_pin.style.color = '#000';
			} else {
				parent.ui.pinned = true;
				parent.html_pin.style.color = '#fff';
			}
		},
		head_content: [],
		body_content: [],
		interval: false,
		current_height: -45,
		add: function (new_element, type, position) {
			if (!type) type = 'body';
			var content = parent.ui[type + '_content'];
			if (typeof(position)=='number'&&position<content.length) {
				content.splice(position, 0, new_element)
			}
			else content.push(new_element);
			parent.ui.draw(type);
		},
		remove: function (old_element, type) {
			if (!type) type = 'body';
			var content = parent.ui[type + '_content'];
			var k = content.indexOf(old_element);
			if (k==-1) return;
			content.splice(k,1);
			parent.ui.draw(type);
		},
		clear: function (type) {
			var content = parent.ui[type + '_content'];
			while (content.length) parent.ui.remove(content[0], type)
			parent.ui.draw(type);
		},
		draw: function (type) {
			var content = parent.ui[type + '_content'], element = parent['html_' + type];
			element.innerHTML = '';
			for (var i = 0; i<content.length; i++) element.appendChild(content[i]);
		},
		expand: function () {
			if (parent.ui.current_height >= parent.html.scrollHeight) {
				clearInterval(parent.ui.interval);
				parent.html.style.overflow = 'visible';
			} else {
				parent.ui.current_height += 3;
				parent.html.style.height = Math.max(23, parent.ui.current_height);
			}
		},
		contract: function () {
			if (parent.ui.current_height <= -45) {
				clearInterval(parent.ui.interval);
				parent.ui.revealed = false;
			} else {
				parent.ui.current_height -= 3;
				parent.html.style.height = Math.max(23, parent.ui.current_height);
			}
		},
		mouseover: function () {
			parent.ui.revealed = true;
			clearInterval(parent.ui.interval);
			parent.ui.interval = setInterval(parent.ui.expand, 20);
			game.do_event(parent, 'mouseover');
		},
		mouseout: function () {
			clearInterval(parent.ui.interval);
			if (!parent.ui.pinned) {
				parent.ui.interval = setInterval(parent.ui.contract, 20);
				parent.html.style.overflow = 'hidden';
			}
		},
		show: function () {
			parent.html.style.display = 'block';
		},
		hide: function () {
			parent.html.style.display = 'none';
		}
	}
	
	parent.html.update = function () {
		if (!parent.unlocked) return;
		for (var i=0; i<parent.ui.head_content.length; i++) if (parent.ui.head_content[i].update) parent.ui.head_content[i].update();
		if (parent.ui.revealed) for (i=0; i<parent.ui.body_content.length; i++) if (parent.ui.body_content[i].update) parent.ui.body_content[i].update();
	}
	
	if (!args.no_contract) {
		parent.html_pin = HL.new_html('div', parent.html_line, 'expander_lock_button', '&#128274;&#65038;');
		parent.html.addEventListener('mouseover', parent.ui.mouseover);
		parent.html.addEventListener('mouseout', parent.ui.mouseout);
		parent.html_pin.addEventListener('click', parent.ui.click_pin);
		if (args.pinned) {
			parent.ui.current_height = parent.html.scrollHeight;
			parent.html.style.height = Math.max(23, parent.ui.current_height);
			parent.ui.click_pin();
		}
	} else {
		parent.html.style.height = 'auto';
		parent.html.style.overflow = 'visible';
		parent.ui.revealed = true;
	}
}

game.format_number = function (n) {
	if (Math.abs(n)>20) return Math.round(n);
	if (Math.abs(n)>5) return Math.round(n * 2) / 2;
	return Math.round(n * 10) / 10;
}

game.greek_chars = function create_greek_chars () {
	var arr = [];
	for (var i = 940; i < 975; i++) arr.push('&#'+i+';');
	return arr;
} ()

game.add_dropdown = function (obj, id, args) {
	
	var dropdown = {
		id: id,
		parent: obj,
		name: args.name,
		show_in: args.show_in
	}
	
	if (!obj.dropdowns) obj.dropdowns = {};
	
	obj.dropdowns[id] = dropdown;
	
	dropdown.ui = {}
	dropdown.ui.container = HL.new_html('div', dropdown.show_in, 'dropdown');
	dropdown.ui.label = HL.new_html('div', dropdown.ui.container, 'dropdown_text', dropdown.name);
	dropdown.ui.button = HL.new_html('div', dropdown.ui.container, 'dropdown_button', 'Select One');
	dropdown.ui.menu = HL.new_html('div', dropdown.ui.container, 'dropdown_menu');
	
	dropdown.options = {}
	
	dropdown.add_option = function (id, name, condition) {
		var new_option = {
			id: id,
			name: name,
			node: HL.new_html('div', dropdown.ui.menu, 'dropdown_option', name),
			highlight: function () {HL.add_class(new_option.node, 'dropdown_selected')},
			unhighlight: function () {HL.remove_class(new_option.node, 'dropdown_selected')},
			click: function () {
				dropdown.selected = id;
			},
			condition: condition
		}
		new_option.node.addEventListener('mouseouver', new_option.highlight);
		new_option.node.addEventListener('mouseout', new_option.unhighlight);
		new_option.node.addEventListener('click', new_option.click);
		dropdown.options[id] = new_option;
		if (dropdown.parent[dropdown.id] == id) dropdown.selected = id;
	}
	
	dropdown.show_menu = function (e) {
		e.stopPropagation();
		for (i in dropdown.options) {
			if (dropdown.options[i].condition&&!dropdown.options[i].condition()) dropdown.options[i].node.style.display = 'none';
			else dropdown.options[i].node.style.display = 'block';
		}
		dropdown.ui.menu.style.display = 'block';
	}
	dropdown.hide_menu = function () {
		dropdown.ui.menu.style.display = 'none';
	}
	dropdown.show = function () {dropdown.ui.node.style.display = 'block'}
	dropdown.hide = function () {dropdown.ui.node.style.display = 'none'}
	
	dropdown.ui.button.addEventListener('click', dropdown.show_menu)
	document.getElementById('game_page').addEventListener('click', dropdown.hide_menu)
	
	var i;
	for (i in args.options) {
		dropdown.add_option(args.options[i].id, args.options[i].name, args.options[i].condition)
	}
	
	Object.defineProperty(dropdown, 'selected', {
		get: function () {return dropdown.parent[id]},
		set: function (v) {
			if (!v) {
				dropdown.ui.button.innerHTML = 'Select One'
				dropdown.parent[id] = false;
			} else {
				dropdown.ui.button.innerHTML = dropdown.options[v].name;
				dropdown.parent[id] = v;
			}
		}
	})
	
	if (dropdown.parent[id]) dropdown.selected = dropdown.parent[id];

}

game.add_spinner = function (obj, id, args) {
	
	var spinner = {
		id: id,
		parent: obj,
		name: args.name,
		show_in: args.show_in,
		click_value: args.click_value||1,
		shift_click_value: args.shift_click_value||5
	}
	
	var min = args.min, max = args.max;
	
	if (!obj.spinners) obj.spinners = {}
	
	obj.spinners[id] = spinner;
	
	spinner.ui = {}
	spinner.ui.container = HL.new_html('div', spinner.show_in, 'spinner');
	spinner.ui.label = HL.new_html('div', spinner.ui.container, 'spinner_text', spinner.name + ': 0');
	spinner.ui.plus = HL.new_html('div', spinner.ui.container, 'spinner_plus', '+');
	spinner.ui.minus = HL.new_html('div', spinner.ui.container, 'spinner_minus', '-');
	
	spinner.plus_click = function (e) {
		var n = (e.shiftKey ? spinner.shift_click_value : spinner.click_value);
		var x = spinner.value + n;
		if (typeof(spinner.max)=='number' && x > spinner.max) x = spinner.max;
		spinner.value = x;
	}
	
	spinner.minus_click = function (e) {
		var n = (e.shiftKey ? spinner.shift_click_value : spinner.click_value);
		var x = spinner.value - n;
		if (typeof(spinner.min)=='number' && x < spinner.min) x = spinner.min;
		spinner.value = x;
	}
	
	spinner.ui.plus.addEventListener('click', spinner.plus_click);
	spinner.ui.minus.addEventListener('click', spinner.minus_click);
	
	Object.defineProperties(spinner, {
		value: {
			get: function () {return spinner.parent[id]},
			set: function (v) {
				spinner.parent[id] = v;
				spinner.ui.label.innerHTML = spinner.name + ': ' + v;
			}
		},
		min: {
			get: function () {return min},
			set: function (v) {
				min = v;
				if (spinner.value<v) spinner.value=min
			}
		},
		max: {
			get: function () {return max},
			set: function (v) {
				max = v;
				if (spinner.value>v) spinner.value=max
			}
		}
	})
	
	value = parent[id] || args.min || 0;
	
}

game.resource_table = [];
for (var i = 0; i<4; i++) {
	game.resource_table[i] = HL.new_html('table', game.regions.resources, 'resource_table')
}
HL.add_class(game.resource_table[3], 'warehouse_table');

game.info_table = HL.new_html('div', game.regions.resources, 'resource_table');

game.warehouse = {} //TODO
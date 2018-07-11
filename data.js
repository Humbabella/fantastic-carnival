data = {
	tabs: [
		{
			name: 'temple',
			title: '???',
			show: true,
			sections: [
				{
					name: 'expand',
					title: 'The Darkness',
					show: true
				},
				{
					name: 'acts',
					title: 'Acts',
				},
				{
					name: 'commandments',
					title: 'Commandments'
				},
				{
					name: 'visions',
					title: 'Visions',
				},
				{
					name: 'completed',
					title: 'Completed'
				}
			]
		},
		{
			name: 'cult',
			title: 'Dark Shapes',
			sections: [
				{
					name: 'humans',
					title: 'Dark Shapes',
					show: true
				},
				{
					name: 'ghouls',
					title: 'Ghouls',
				},
				{
					name: 'beasts',
					title: 'Beasts'
				}
			]
		},
		{
			name: 'social',
			title: 'Culture',
			sections: [
				{
					name: 'professions',
					title: 'Professions'
				},
				{
					name: 'philosophy',
					title: 'Philosophy'
				}
			]
		},
		{
			name: 'research',
			title: 'Research',
			sections: [
				{
					name: 'researching',
					title: 'Researching',
					show: true
				},
				{
					name: 'technology',
					title: 'Technology'
				},
				{
					name: 'society',
					title: 'Society'
				},
				{
					name: 'religion',
					title: 'Religion'
				},
				{
					name: 'science',
					title: 'Science'
				},
				{
					name: 'improvements',
					title: 'Improvements',
				},
				{
					name: 'completed',
					title: 'Completed'
				}
			]
		},
		{
			name: 'works',
			title: 'Works',
			sections: [
				{
					name: 'buildings',
					title: 'Enclave'
				},
				{
					name: 'monuments',
					title: 'Monuments'
				},
				{
					name: 'completed',
					title: 'Completed'
				}
			]
		},
		{
			name: 'exploration',
			title: 'Exploration',
			sections: [
				{
					name: 'maps',
					title: 'Maps',
					show: true
				},
				{
					name: 'projects',
					title: 'Projects',
					show: true
				},
				{
					name: 'exploration',
					title: 'Exploration',
					show: true
				},
				{
					name: 'mining',
					title: 'Mining'
				},
				{
					name: 'town',
					title: 'Town Management'
				},
				{
					name: 'wilds',
					title: 'Wilderness'
				}
			]
		},
		{
			name: 'heavens',
			title: 'The Heavens',
			sections: [
				{
					name: 'starchart',
					title: 'Starchart',
				},
				{
					name: 'deities',
					title: 'Pantheon',
					show: true
				}
			]
		}
	],
	logs: [
		{
			name: 'all',
			title: 'All',
			validate: function () {return true}
		},
		{
			name: 'tech',
			title: 'Development',
			validate: function (x) {return x == 'tech'}
		}
	],
	object_data: {
		
//RESOURCES
		
		will: {
			object_type: 'resource',
			title: 'Will',
			base_max: 100,
			table: 1,
			saves: {stopped: false},
			tooltip: 'Your ability to enact your desires. After remaining silent for some time it will begin to return.',
			mods: [
				{
					id: 'will',
					name: 'up_tick',
					func: function (x, me) {return me.stopped ? 0 : 30},
					order: 10
				}
			],
			events: {
				update_value: [
					{
						f: function (args) {
							if (args.value<args.old_value) {
								args.parent.stopped = new Date().getTime();
								game.apply_mods('will');
							}
						},
						o: 10
					}
				]
			},
			construct: function (me) {
				me.check_timer = function (t) {
					if (me.stopped && t > me.stopped + 60000) {
						me.stopped = false;
						game.apply_mods('will');
					}
				}
				game.each_tick.push(me.check_timer);
			}
		},
		influence: {
			object_type: 'resource',
			title: 'Influence',
			no_max: true,
			table: 1,
			cvars: {decay: 0.5},
			tooltip: function (me) {
				return 'The extent to which other things depend on you. If your influence is at least 10 times your number of ' + game.ids.humans.title + ' then more will be attracted to you. Influence decays over time.'
			},
			format_tick: function format_influence_tick (value) {
				if (value > 0) return '(waxing)';
				if (value == 0) return '';
				return '(waning)'
			},
			mods: [
				{
					id: 'influence',
					name: 'down_tick',
					func: function (x, me) {
						me.current_decay = me.value * me.decay * 30;
						return x + me.current_decay;
					},
					order: 400
				},
				{
					id: 'inveiglement',
					name: 'up_tick',
					func: function (x, me) {
						return x + ((Math.floor(me.value/10) >= game.ids.humans.value) ? 10 : 0);
					},
					order: 400
				},
				{
					id: 'disillusionment',
					name: 'up_tick',
					func: function (x, me) {
						return x + ((Math.floor(me.value/10) < game.ids.humans.value - 1) ? 10 : 0);
					},
					order: 400
				}
			]
		},
		corpses: {
			object_type: 'resource',
			title: 'Corpses',
			no_max: true,
			table: 1,
			cvars: {disease: 1/12},
			format_tick: function format_corpse_tick (value) {
				if (value < 0) return '(rotting)';
				return '';
			},
			mods: [
				{
					id: 'disease',
					name: 'up_tick',
					func: function (x, me) {return x + ((me.value > me.max) ? (me.value - me.max) * me.disease : 0);},
					order: 400
				},
				{
					id: 'rot',
					name: 'up_tick',
					func: function (x, me) {if (me.value <= me.max) return x; var v = Math.max(2, me.value - me.max); var v = Math.log(.5) / Math.log((v-1)/v) * 10/3; return x + v;},
					order: 400
				}
			]
		},
		pyres: {
			object_type: 'command',
			title: 'Funeral Pyres',
			button_text: ['Light the pyres', 'Unlight the pyres'],
			on_description: 'The pyres are lit.',
			description: 'Burn corpses if there is no place in mausoleums.',
			show_in: {tab: 'temple', section: 'commandments'},
			construct: function (me) {
				me.burn_dead = function (args) {
					if (me.on) {
						args.value = args.parent.max;
						args.parent.fraction = 0;
					}
				}
				game.add_event(game.ids.corpses, 'overflow', me.burn_dead, 700);
			}
		},
		foreboding: {
			object_type: 'resource',
			title: '<span class=\'horrific\'>Foreboding</span>',
			no_max: true,
			table: 1,
			mods: [
				{
					name: 'ominousness',
					id: 'starchart',
					func: function (x, me) {return x + Math.log10(1 + me.value)}
				}
			]
		},
		lost_epochs: {
			object_type: 'resource',
			title: '<span class=\'horrific\'>Dreams</span>',
			no_max: true,
			table: 1
		},
		esoterica: {
			object_type: 'resource',
			title: '<span class=\'horrific\'>Esoterica<span>',
			no_max: true,
			table: 1
		},
		rot: {
			object_type: 'timer',
			title: 'Rot',
			base_max: 1,
			events: {
				complete: [
					{
						f: function (args) {
							game.resources.adjust('corpses', 0, 1);
							if (game.ids.corpses.unlocked) {
								game.log.add('A corpse rots away.');
							}
						}
					}
				]
			}
		},
		disease: {
			object_type: 'timer',
			title: 'Disease',
			base_max: 1,
			table: 1,
			cvars: {kill_cap: 0.8},
			events: {
				complete: [
					{
						f: function (args) {
							var p = args.parent, h = game.ids.humans;
							args.value -= p.max;
							if (args.value < 0) args.value = 0;
							var d = Math.min(p.max, h.value * p.kill_cap);
							d = Math.floor(d) + (HL.r() < d - Math.floor(d) ? 1 : 0);
							if (d > 0) {
								game.species.adjust('humans', 0, 0, d);
								game.log.add('A disease ravages your followers, killing '+d+'.', 'big_death');
							}
						}
					}
				]
			}
		},
		inveiglement: {
			object_type: 'timer',
			title: 'Inveiglement',
			base_max: 1,
			cvars: {arrive_message: 'A shape takes form in the darkness.'},
			events: {
				complete: [
					{
						f: function (args) {
							game.unlock('humans');
							game.ids.humans.recruit();
							game.log.add(args.parent.arrive_message);
						}
					}
				]
			},
			table: 1,
		},
		capture: {
			object_type: 'timer',
			title: 'Beast Capture',
			base_max: 1,
			cvars: {arrive_message: 'Your followers capture a beast from the wild.'},
			events: {
				complete: [
					{
						f: function (args) {
							game.unlock('beasts');
							game.species.adjust('beasts',1);
							game.log.add(args.parent.arrive_message);
						}
					}
				]
			},
			table: 1,
		},
		disillusionment: {
			object_type: 'timer',
			title: 'Disillusionment',
			base_max: 1,
			cvars: {leave_message: 'A dark shape drifts outside you influence.'},
			events: {
				complete: [
					{
						f: function (args) {
							if (game.specie.humans.value <= 0) return;
							game.species.adjust('humans', 0, 0, 1);
							game.log.add(args.parent.leave_message);
						}
					}
				]
			}
		},
		exposure: {
			object_type: 'timer',
			title: 'Exposure',
			base_max: 1,
			cvars: {hospitableness: 3, exposure_message: 'A dark shape is consumed by the darkness.'},
			events: {
				complete: [
					{
						f: function (args) {
							game.species.adjust('humans', 0, 0, 1);
							game.log.add(args.parent.exposure_message);
						}
					}
				]
			}
		},
		farming: {
			object_type: 'resource',
			title: 'Farming',
			base_max: 0
		},
		harvest: {
			object_type: 'timer',
			title: 'Harvest',
			base_max: 1,
			events: {
				complete: [
					{
						f: function (args) {
							var f = game.ids.farming.value;
							if (f>0) {
								game.resources.adjust('food', f);
								game.resources.adjust('farming', -f);
								game.log.add('Your farms produce ' + f + ' ' + game.ids.food.title + '.');
							}
						}
					}
				]
			}
		},
		food: {
			object_type: 'resource',
			title: 'Sustenance',
			no_max: true,
			cvars: {decay: 20},
			table: 2,
			mods: [
				{
					id: 'food',
					name: 'down_tick',
					func: function (x, me) {
						if (me.value<=me.max) return x;
						me.current_decay = (me.value - me.max) * me.decay;
						return x + me.current_decay;
					},
					order: 400
				},
				{
					id: 'disease',
					name: 'up_tick',
					func: function (x, me) {return x + (me.value > me.max ? (me.value - me.max) / 30 : 0);},
					order: 400
				}
			]
		},
		purity: {
			object_type: 'command',
			title: 'Food Purity',
			button_text: ['Command purity', 'Abolish purity'],
			on_description: 'Food purity rules are in force.',
			description: 'Purity rules that insist only clean food be eaten.',
			show_in: {tab: 'temple', section: 'commandments'},
			construct: function (me) {
				me.discard_rot = function (args) {
					if (me.on) {
						args.value = args.parent.max;
						args.parent.fraction = 0;
					}
				}
				game.add_event(game.ids.food, 'overflow', me.discard_rot, 700);
			}
		},
		labour: {
			object_type: 'resource',
			title: 'Usefulness',
			base_max: 0,
			table: 2
		},
		fabrications: {
			object_type: 'resource',
			title: 'Fabrications',
			base_max: 50,
			table: 2
		},
		knowledge: {
			object_type: 'resource',
			title: 'Knowledge',
			base_max: 50,
			table: 2
		},
		ore: {
			object_type: 'resource',
			title: 'Rudiments',
			base_max: 20,
			table: 2
		},
		rarities: {
			object_type: 'resource',
			title: 'Rarities',
			base_max: 5,
			table: 2
		},
		culture: {
			object_type: 'resource',
			title: 'Urbanity',
			base_max: 10,
			table: 2
		},
		
//STORES

		warehousing: {
			object_type: 'store',
			title: 'Warehousing',
			stores: 'fabrications',
			cost: {labour: 10, fabrications: 10},
			sell: {labour: 10},
			effect: 50
		},
		pantry: {
			object_type: 'store',
			title: 'Pantry',
			stores: 'food',
			cost: {labour: 10, food: 5},
			sell: {labour: 10},
			effect: 20
		},
		archive: {
			object_type: 'store',
			title: 'Archive',
			stores: 'knowledge',
			cost: {labour: 10, knowledge: 10},
			sell: {labour: 10},
			effect: 25
		},
		cellar: {
			object_type: 'store',
			title: 'Cellar',
			stores: 'ore',
			cost: {labour: 50, fabrications: 20, ore: 5},
			effect: 20
		},

//JOBS		

		worshipper: {
			object_type: 'job',
			title: 'Propagating',
			generates: {influence: 450},
			description_function: function (me) {return me.total_effect <= 0 ? 'Assign ' + game.ids.humans.title + ' to generate ' + game.ids.influence.title + '.' : 'Generating ' + me.total_effect + ' ' + game.ids.influence.title + ' per Epoch.'}
		},
		hunter: {
			object_type: 'job',
			title: 'Maintaining',
			generates: {food: 200},
			tooltip: function (me) {}
		},
		farmer: {
			object_type: 'job',
			title: 'Farmer',
			generates: {farming: 400},
			mods: [
				{
					id: 'harvest',
					name: 'up_tick',
					func: function (x, me) {return me.count > 0 ? 20 : 0},
					order: 10
				}
			],
			tooltip: function (me) {}
		},
		labourer: {
			object_type: 'job',
			title: 'Functioning',
			generates: {labour: 50},
			tooltip: function (me) {},
			mods: [
				{
					id: 'labour',
					name: 'max',
					func: function (x, me) {return x + me.count * me.labour_effect * game.jobs.level_bonus(me.level)},
					order: 400
				}
			]
		},
		manufacturer: {
			object_type: 'job',
			title: 'Manufacturer',
			generates: {fabrications: 50},
			tooltip: function (me) {},
		},
		contemplative: {
			object_type: 'job',
			title: 'Contemplative',
			generates: {knowledge: 25},
			tooltip: function (me) {},
		},
		researcher: {
			object_type: 'job',
			cvars: {effect: 1},
			title: 'Researcher',
			mods: [
				{
					id: 'research',
					name: 'effect',
					func: function (x, me) {return x + me.count * me.effect * game.jobs.level_bonus(me.level)},
					order: 400
				}
			],
			tooltip: function (me) {}
		},
		
//SPECIES	

		humans: {
			object_type: 'specie',
			title: 'Dark Shapes',
			default_job: 'worshipper',
			cvars: {recruit_amount: 1},
			jobs: {
				worshipper: {priority: true, base_efficiency: 5, level_efficiency: 1},
				hunter: {priority: true, base_efficiency: 12, level_efficiency: 1},
				farmer: {priority: true, base_efficiency: 5, level_efficiency: 1},
				labourer: {base_efficiency: 5, level_efficiency: 1},
				manufacturer: {base_efficiency: 5, level_efficiency: 1},
				contemplative: {base_efficiency: 5, level_efficiency: 1},
				researcher: {base_efficiency: 5, level_efficiency: 1}
			},
			mods: [
				{
					id: 'exposure',
					name: 'up_tick',
					func: function (x, me) {
						return x + (me.value > me.max ? 10 * Math.pow(2, me.value - me.max - game.ids.exposure.hospitableness, 0) : 0)
					},
					order: 400
				}
			],
			hunger: 100,
			food_type: 'food',
			starve_message: 'A dark shape collapses in on itself.',
			events: {
				kill: [
					{
						f: function (args) {
							game.resources.adjust('corpses', args.killed);
						}
					}
				],
				update_value: [
					{
						f: function (me) {
							game.compute_cvar('inveiglement', 'up_tick');
							game.compute_cvar('disillusionment', 'up_tick');
							game.apply_mods(me);
						}
					}
				],
				update_max: [
					{
						f: function (me) {
							game.compute_cvar('exposure', 'up_tick');
						}
					}
				]
			},
			tooltip: function (me) {
				return 'Those who have entered your service.'
			},
			construct: function (me) {
				me.recruit = function () {
					var w = Math.floor(me.recruit_amount), r = me.recruit_amount - w;
					if (HL.r() < r) w++;
					game.species.adjust(me, w);					
				}
			}
		},
		beasts: {
			object_type: 'specie',
			title: 'Beasts',
			default_job: 'labourer',
			jobs: {
				labourer: {base_efficiency: 5},
				farmer: {base_efficiency: 2}
			},
			hunger: 100,
			food_type: 'food',
			starve_message: 'A beast has starved to death.',
			events: {
				kill: [
					{
						f: function (args) {
							game.resources.adjust('corpses', args.killed);
							game.resources.adjust('food', args.killed * 10);
						}
					}
				],
				overflow: [
					{
						f: function (args) {
							var v = args.value - args.parent.max;
							game.resources.adjust('corpses', v);
							game.resources.adjust('food', v * 10);
							args.value -= v;
							game.log.add('Having nowhere to house ' + v + ' ' + args.parent.title + ' your followers slaughter them for food.');
						}
					}
				]
			}
		},
		ghouls: {
			object_type: 'specie',
			title: 'Ghouls',
			default_job: 'labourer',
			jobs: {
				labourer: {base_efficiency: 10, multiplier: .8},
				worshipper: {base_efficiency: 1/0, multiplier: .5}
			},
			hunger: 3,
			food_type: 'corpses',
			events: {
				starve: [
					{
						f: function (args) {
							if (game.ids.humans.value >=1) {
								game.log.add('Your starving ghouls murder a follower to get something to eat.'),
								game.species.adjust('humans', 0, 0, 1)
								args.value = 0;
							} else {
								game.log.add('Your ghouls go mad with hunger and turn on each other'),
								args.value = args.parent.value;
							}
						}
					}
				],
				overflow: [
					{
						f: function (args) {
							var x = args.value - args.parent.max;
							var d = HL.rand_norm(1, 1/3) * x * 2;
							d = Math.max(Math.min(Math.round(d), game.species.humans.value),1);
							if (x==1) game.log.add('A ghoul becomes uncontrolled and kills ' + d + ' followers before it is destroyed');
							else game.log.add(x + ' ghouls become uncontrolled and kill ' + d + ' followers before they are destroyed.');
							game.species.adjust('humans', 0, 0, 1);
							args.value -= x;
						}
					}
				]
			}
		},
		

//ACTS		

		whisper: {
			object_type: 'act',
			title: 'Whisper into the Darkness',
			description: function (me) {return 'Gain '+Math.floor(me.amount)+' influence.'},
			cooldown: 1/180,
			cvars: {amount: 10/3},
			cost: {will: 1},
			result: function (me) {
				game.unlock('influence');
				game.resources.adjust('influence', me.amount);
			},
			show_in: {
				tab: 'temple',
				section: 'acts'
			},
			unlocked: 1
		},
		/*expedite: {
			object_type: 'act',
			title: 'Explore',
			description: 'Explore a new portion of the world and place its map in the selected tile.',
			cooldown: 8,
			cost: {},
			result: function (me) {
				game.world.discover_tile(game.world.selected);
			},
			show_in: {
				add_to: ['world', 'panel']
			},
			unlocked: 1
		},*/
		
//VISIONS		

		sustain: {
			object_type: 'vision',
			title: 'Sustenance',
			description: 'These things have ways to sustain themselves if so directed.',
			show_in: {tab: 'temple', section: 'visions'},
			cost: {influence: 35},
			apply: function () {
				game.specie.humans.unlock_job('hunter');
			},
			unlocks: ['food']
		},
		production: {
			object_type: 'vision',
			title: 'Usefulness',
			description: 'These things may have use beyond merely being.',
			show_in: {tab: 'temple', section: 'visions'},
			cost: {influence: 35},
			apply: function () {
				game.specie.humans.unlock_job('labourer');
			},
			unlocks: ['labour']
		},
		enlightenment: {
			object_type: 'vision',
			title: 'Enlightenment',
			description: 'What you can reveal to these beings!',
			show_in: {tab: 'temple', section: 'visions'},
			cost: {influence: 50},
			apply: function () {
				game.junction.unlock('research');
				game.specie.humans.unlock_job('researcher');
			},
			unlocks: ['tools', 'tsatha']
		},
		time: {
			object_type: 'vision',
			title: 'Time',
			description: 'For these things there is a before and and after, a sequence and an order.',
			show_in: {tab: 'temple', section: 'visions'},
			cost: {influence: 25},
			unlocks: ['calendar']
		},
		open_heavens: {
			object_type: 'vision',
			title: 'The Stars',
			description: 'Your followers need but lift their eyes to see the truth.',
			show_in: {tab: 'temple', section: 'visions'},
			cost: {influence: 50},
			unlocks: ['pantheon']
		},
		exploration: {
			object_type: 'vision',
			title: 'The World',
			description: 'Such an expanse of corporeity surrounds your followers.',
			show_in: {tab: 'temple', section: 'visions'},
			cost: {influence: 65},
			apply: function () {
				if (game.world.tiles.length==0) game.world.make_tile();
			},
			unlocks: ['expedite', 'world', 'maps', 'ore', 'mining', 'metalworking', 'trapping', 'hisessifsiths']
		},
		
//TECHS
		
		tools: {
			object_type: 'tech',
			title: 'Tools',
			description: 'Reveal the cumulativity of order.',
			announce: 'You can assign followers to be manufacturers who create fabrications.',
			show_in: {tab: 'research', section: 'technology'},
			cost: {influence: 100, labour: 25},
			time: 0.5,
			age: 0,
			apply: function () {
				game.specie.humans.unlock_job('manufacturer');
			},
			unlocks: ['fabrications', 'construction', 'fire', 'wheel']
		},
		construction: {
			object_type: 'tech',
			title: 'Construction',
			age: 0,
			description: 'Show your followers the objects of cumulative ordering.',
			announce: 'You may construct two new works. Hovels provide housing for one follower, preventing their death from exposure. Sheds provide storage space that can be allocatede to increase the maximum amount of various resources.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 25, fabrications: 25},
			basic: true,
			unlocks: ['hovel', 'shed', 'pulley', 'preservation', 'pictograms', 'masonry', 'archery']
		},
		fire: {
			object_type: 'tech',
			title: 'Fire',
			age: 0,
			description: 'Show your followers how to invoke the volatility of energy.',
			announce: 'You can build a new monument. The Bonfire reduces the rate at which followers die of exposure.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {influence: 80, labour: 20, fabrications: 20},
			basic: true,
			unlocks: ['bonfire', 'oral_history']
		},
		wheel: {
			object_type: 'tech',
			title: 'The Wheel',
			age: 0,
			description: 'Reveal the shape of time and its encoding in corporeity.',
			announce: 'Your labourers are far more efficient.',
			show_in: {tab: 'research', section: 'technology'},
			cost: {labour: 25, fabrications: 25},
			time: 1,
			basic: true,
			mods: [
				{
					id: 'labourer',
					name: 'labour_effect',
					func: function (z, me) {return z + 50},
					order: 400
				}
			],
			unlocks: ['pulley']
		},
		pulley: {
			object_type: 'tech',
			title: 'The Pulley',
			cvars: {effect: 1},
			locks: 2,
			age: 1,
			show_in: {tab: 'research', section: 'technology'},
			description: 'Reveal the winding of time and it\'s mirror in corporeal forces.',
			announce: 'You can construct housing and storage a piece at a time.',
			cost: {labour: 50, fabrications: 25},
			mods: [
				{
					name: 'installments',
					ids: ['hovel', 'shed'],
					order: 400,
					func: function (x, me) {
						return x + (me.complete ? me.effect : 0)
					}
				}
			]
		},
		preservation: {
			object_type: 'tech',
			title: 'Preservation',
			description: 'Show your followers a transumation of sustenance to reorder entropic events.',
			announce: 'You can assign storage space to be a granary which increases the maximum sustenance capacity.',
			show_in: {tab: 'research', section: 'technology'},
			age: 0,
			time: 1,
			cost: {labour: 25},
			fixed_cost: {food: 50},
			basic: true,
			unlocks: ['pantry', 'glass', 'purity']
		},
		oral_history: {
			object_type: 'tech',
			title: 'Oral History',
			description: 'Reveal the enigma of revealing enigmas.',
			announce: 'When followers die, the job they were performing gains experience. As jobs gain experience they become more effective and reduce the penalty for assigning multiple followers to the same job.',
			age: 0,
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {influence: 150},
			basic: true,
			construct: function (me) {
				me.death_xp = function (args) {
					if (args.killed <= 0) return;
					var v = (args.old_value - args.value) / args.killed;
					for (var i in game.ids.humans.jobs) {
						game.jobs.gain_experience(i, (args[i] - game.ids.humans.jobs[i].count)*v);
					}
				}
			},
			apply: function (me) {game.add_event(game.ids.humans, 'kill', me.death_xp)},
			unlocks: ['cave_painting', 'superstition', 'folk_medicine', 'open_heavens']
		},
		cave_painting: {
			object_type: 'tech',
			title: 'Cave Painting',
			description: 'Reshape space to encode your whispers.',
			announce: 'You can assign your followers to be contemplatives who generate ingenuity.',
			show_in: {tab: 'research', section: 'society'},
			age: 0,
			time: 1,
			cost: {influence: 150},
			basic: true,
			apply: function () {
				game.specie.humans.unlock_job('contemplative');
			},
			unlocks: ['pictograms', 'engineering', 'knowledge']
		},
		pictograms: {
			object_type: 'tech',
			title: 'Pictograms',
			locks: 2,
			age: 1,
			description: 'Perfect encoding of your whispers.',
			announce: 'You can assign storage space to be archives, which increase maximum ingenuity.',
			time: 1,
			show_in: {tab: 'research', section: 'society'},
			cost: {influence: 75, knowledge: 13},
			basic: true,			
			unlocks: ['alphabet', 'archive']
		},
		superstition: {
			object_type: 'tech',
			title: 'Superstition',
			age: 0,
			description: 'Reveal the ultimate truth, though your followers can only touch a tiny sliver of it.',
			announce: 'You can construct a new monument. The icon generates influence over time.',
			show_in: {tab: 'research', section: 'religion'},
			time: 1,
			cost: {influence: 150},
			unlocks: ['burial', 'astrology', 'idol', 'corpses', 'time_corpse_rot']
		},
		idolatry: {
			object_type: 'tech',
			title: 'Idolatry',
			age: 1,
			description: 'Give your followers further access to the turth using a simpler lie.',
			announce: 'Worshippers can be assigned to use gathered influence to directly pay the cost of new works and visions.',
			show_in: {tab: 'research', section: 'religion'},
			time: 1,
			cost: {influence: 150},
			unlocks: ['scheme_idolatry']
		},
		cooking: {
			object_type: 'tech',
			title: 'Cooking',
			age: 0,
			description: 'Reveal a transmutation of sustenance using volatile energy.',
			announce: 'Your followers each require less sustenance to survive.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 20, fabrications: 20, food: 40},
			mods: [
				{
					id: 'humans',
					name: 'hunger',
					order: 700,
					func: function (x, me) {
						return x * .8
					}
				}
			]
		},
		archery: {
			object_type: 'tech',
			title: 'Weapons',
			age: 0,
			description: 'Reveal a transmutation of objects of order to create objects of disorder.',
			announce: 'Your gatherers are now hunters who produce more food as you build up your armory.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 25, fabrications: 35},
			mods: [
				{
					id: 'hunter',
					id: 'title',
					order: 20,
					func: function (x, me) {return 'Hunter'}
				}
			],
			unlocks: ['armory']
		},
		trapping: {
			object_type: 'tech',
			title: 'Trapping',
			age: 1,
			cvars: {food_effect: 100},
			description: 'Reveal shape of corporeal enigmas.',
			announce: 'Your followers can set traps for herds of beasts, converting labour into sustenance.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 65, fabrications: 25},
			fixed_cost: {food: 20},
			apply: function () {
				game.landmark.herd.unlock_flag('herd_trap');
			},
			unlocks: ['domestication']
		},
		astrology: {
			object_type: 'tech',
			title: 'Astrology',
			age: 2,
			description: 'Another sliver of the ultimate truth, the whims of the entities that govern your follower\'s world.',
			announce: 'You can now read descriptions of the deities by clicking on their starsigns on the starchart. You can build a new work. The orcale oracle increases the number of future epochs that are shown on the starchart.',
			show_in: {tab: 'research', section: 'religion'},
			time: 1,
			cost: {influence: 150},
			unlocks: ['theology', 'mysticism', 'oracle', 'pantheon']
		},
		burial: {
			object_type: 'tech',
			title: 'Burial',
			age: 1,
			description: 'Reveal a transmutation of your followers to reorder entropic events.',
			announce: 'You can build a new monument. The mausoleum increases the maximum number of corpses that can be stored before rotting begins.',
			show_in: {tab: 'research', section: 'religion'},
			time: 1,
			cost: {influence: 80, labour: 40, fabrications: 20},
			fixed_cost: {corpses: 2},
			unlocks: ['mausoleum']
		},
		agriculture: {
			object_type: 'tech',
			title: 'Agriculture',
			age: 1,
			description: 'Reveal the cumulativity of life.',
			announce: 'You can build a new work. The farm produces food as long as you have followers assigned to be farmers.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 75},
			fixed_cost: {food: 10},
			apply: function () {
				game.specie.humans.unlock_job('farmer');
				game.specie.beasts.unlock_job('farmer');
			},
			unlocks: ['plow', 'farm']
		},
		folk_medicine: {
			object_type: 'tech',
			title: 'Folk Medicine',
			age: 1,
			description: 'Witness as your followers apply your teachings of order and entropy to new causes.',
			announce: 'You can build a new work. The apothecary\'s reduces the impact of disease.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {influence: 100, labour: 50},
			unlocks: ['apothecarys']
		},
		irrigation: {
			object_type: 'tech',
			title: 'Irrigation',
			age: 2,
			locks: 2,
			description: 'Teach your followers how to increase the production of life by inscribing glyphs of moving fluid.',
			announce: 'Engineering now improves the maximum food for each farm.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 50, fabrications: 25},
			apply: function () {
				/*game.improvements.engineering.atoms.push({
					name: 'max',
					id: 'farm',
					order: 700,
					func: function (x) {
						return x * (1 + .1 * game.improvements.engineering.level)
					}
				});
				HL.apply_atoms(game.improvements.engineering);*/
			}
		},
		compass: {
			object_type: 'tech',
			title: 'Compass',
			age: 2,
			description: 'Reveal how the shape of the world of your followers is determined by attractive forces.',
			announce: 'Allows you to find new paths between different maps.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 50, ore: 2.5},
			unlocks: ['remap']
		},
		sailing: {
			object_type: 'tech',
			title: 'Sailing',
			age: 2,
			description: 'Reveal the similarities of conveyance by solids and by fluids.',
			announce: 'Your followers can build boats that are required for advanced expeditions.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {influence: 80, labour: 40, fabrications: 20},
			unlocks: ['boats']
		},
		alphabet: {
			object_type: 'tech',
			title: 'Alphabet',
			age: 1,
			description: 'Witness as your followers corrupt your revealed representations of knowledge with their limited potential for understanding.',
			announce: 'Your followers can develop a number of new sciences.',
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {},
			fixed_cost: {knowledge: 100},
			no_knowledge: true,
			unlocks: ['guilds', 'encyclopedia', 'drama']
		},
		masonry: {
			object_type: 'tech',
			title: 'Masonry',
			age: 2,
			locks: 2,
			description: 'Witness as your followers corrupt your teachings on the purpose of order with their limited potentail to reorganize corporeity.',
			announce: 'You can build two new works. Warehouses have even more storage than sheds. Houses protect more followers from exposure than hovels.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 50, fabrications: 25},
			unlocks: ['storage', 'house']
		},
		metalworking: {
			object_type: 'tech',
			title: 'Metalworking',
			age: 2,
			description: 'Witness as your followers corrupt your teachings on cumulative order with their limited potential to reorganize corporeity.',
			announce: 'You can build a new work. The smelter increases the amount by which storage increases maximum fabrications',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 30, fabrications: 25, ore: 1.5},
			fixed_cost: {ore: 5},
			unlocks: ['iron_working', 'stoicism', 'smelter', 'cellar']
		},
		mining: { 
			object_type: 'tech',
			title: 'Mining',
			age: 2,
			description: 'Witness as your followers differentiate corporeity into categories by usefulness.',
			announce: 'Your followers can become miners, who very quickly gather resources from explored regions. You can also assign storage space to cellars which increase the maximum amount of ore.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 75},
			fixed_cost: {ore: 1},
			apply: function () {
				game.landmark.mine.dig_mine.unlock();
			},
			unlocks: ['trade']
		},
		theology: {
			object_type: 'tech',
			title: 'Theology',
			age: 2,
			locks: 2,
			description: 'A theory of gods.',
			announce: 'You followers theorize about the existence of other gods connected with the stars.',
			show_in: {tab: 'research', section: 'religion'},
			time: 1,
			cost: {influence: 100, culture: 2.5},
			apply: function () {
				/*game.consoles.theology_console.unlock();
				game.acts.expedite.unlock();
				deity_effect_line = HL.new_html('div', 0, 'node_line');
				deity_love_line = HL.new_html('div', 0, 'node_line');
				game.deity_chooser.ui.add(deity_effect_line);
				game.deity_chooser.ui.add(deity_love_line);
				function make_effect_and_love (args) {
					if (args.sign) {
						deity_effect_line.innerHTML = '<br>' + args.sign.deity.effect_text;
						if (args.sign.deity.love_text[args.sign.deity.hatred])deity_love_line.innerHTML = '<br>' + args.sign.deity.love_text[args.sign.deity.hatred];
						else deity_love_line.innerHTML = '';
					}
				}
				game.deity_chooser.draw_sign.add_result(make_effect_and_love);*/
			},
			mods: [
				{
					name: 'learnedness',
					id: 'heavens',
					order: 20,
					func: function (x, me) {return 2}
				}
			]
		},
		domestication: {
			object_type: 'tech',
			title: 'Domestication',
			age: 2,
			description: 'Domestication of animals to serve your followers.',
			announce: 'Your followers can now build animal pens which allow the capture of Beasts that generate and store labour but utilize food.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 50, food: 50},
			unlocks: ['beasts', 'riding', 'plow', 'animal_pen', 'beasts']
		},
		riding: {
			object_type: 'tech',
			title: 'Riding',
			age: 2,
			description: 'Riding beasts to explore more quickly.',
			announce: 'Your followers can now create mounts to bring on expeditions. If an expedition is launched and a mount is available then the time the expedition takes will be reduced.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 50, food: 50},
			apply: function () {
				/*var check_mount = function (args) {
					if (game.works.mounts.level>0) {
						var c = game.dosh.consider({cost: {mounts: 1}});
						c.pay();
						game.acts.expedite.quickened = .9;
					}
				}
				game.acts.expedite.cast.add_result(check_mount, 600);*/
			},
			unlocks: ['mounts']
		},
		plow: {
			object_type: 'tech',
			title: 'Plow',
			age: 2,
			locks: 2,
			description: 'A device to help till soil. Especially effective with beasts.',
			announce: 'You can now assign multiple beasts to assist with farming.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 50, fabrications: 25},
			mods: [
				{
					name: 'efficiency',
					id: 'beasts_farmer',
					order: 400,
					func: function (x, me) {return x + 4}
				}
			]
			
		},
		bronze_working: {
			object_type: 'tech',
			title: 'Bronze Working',
			age: 3,
			description: 'TBD',
			announce: '',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 75, fabrications: 75},
			unlocks: ['ironworks']
		},
		trade: {
			object_type: 'tech',
			title: 'Trade',
			age: 2,
			locks: 2,
			description: 'Exchanging goods and ideas with others.',
			announce: 'You can build a trade post that improves relationships with other settlements.',
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {influence: 12.5, labour: 25, fabrications: 12.5, food: 5, culture: 1.25},
			unlocks: ['tech_currency', 'drama', 'trade_post']
		},
		civil_service: {
			object_type: 'tech',
			title: 'Town Management',
			age: 2,
			description: 'Organization of people to assist in governance.',
			announce: 'You can send followers to manage towns.',
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {influence: 150},
			apply: function () {
				game.landmark.village.unlock_flag('infiltration');
			},
			unlocks: ['trade', 'guilds', 'philosophy', 'culture']
		},
		philosophy: {
			object_type: 'tech',
			title: 'Philosophy',
			age: 2,
			description: 'A contest of ideas that influence action.',
			announce: 'Your followers can now develop philosophies on the culture tab.',
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {influence: 150},
			unlocks: ['mysticism', 'hedonism', 'determinism', 'stoicism', 'solipsism']
		},
		archaeology: {
			object_type: 'tech',
			title: '<span class=\'horrific\'>Archaeology</span>',
			description: 'Searching for ancient truths.',
			age: 99,
			announce: 'You may now send archaeological expeditions to sites of interest.',
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {labour: 50},
			fixed_cost: {foreboding: 5},
			apply: function () {
				//game.consoles.archaeology_console.unlock();
			}
		},
		tech_currency: {
			object_type: 'tech',
			title: 'Currency',	
			age: 3,
			locks: 2,
			description: 'A universal symbol of value.',
			announce: 'Your merchants can now trade resources for currency which can be spent in place of other common resources for works.',
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {labour: 40, fabrications: 20, culture: 2},
			fixed_cost: {rarities: 1},
			apply: function () {
				/*game.resources.currency.unlock();
				game.interests.village.new_flag({
					title: 'Trade',
					icon: '$',
					on: 0,
					toggle: function (parent) {
						console.log(parent);
						return ['Start Selling ' + game.resources[parent.buy_type].name, 'Stop Selling ' + game.resources[parent.buy_type].name]
					},
					toggle_cost: [],
					description: function (parent) {
						return 'You will lose some ' + game.resources[parent.buy_type].name + ' each epoch but gain some currency.'
					},
					shut_off: function (parent) {
						return game.resources[parent.buy_type].value<=0
					},
					mods: [
						{
							name: 'tick',
							id: function (parent) {
								return parent.buy_type
							},
							order: 900,
							seed_func: function (x, me) {return x - 100 * me.population}
						},
						{
							name: 'tick',
							id: 'currency',
							order: 400,
							seed_func: function (x, me) {return x + 20 * game.governance[me.governance].trade * me.population}
						}
					]
				});				*/
			},
			unlocks: ['civil_service', 'solipsism']
		},
		lenses: {
			object_type: 'tech',
			title: 'Corrective Lenses',
			age: 3,
			description: 'Lenses to assist those who have difficulty seeing.',
			announce: 'You are able to efficiently assign more followers to tasks.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 65, fabrications: 12.5},
			fixed_cost: {rarities: 5},
			mods: [
				{
					name: 'efficiency_bonus',
					id: 'humans',
					order: 400,
					func: function (x) {return x+2}
				}
			]
		},
		glass: {
			object_type: 'tech',
			title: 'Glass',
			age: 3,
			description: 'A transparent material useful in construction and storage.',
			announce: 'Homes your followers build are less inadequate.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {influence: 15, labour: 30, fabrications: 15, ore: 1.5},
			mods: [
				{
					name: 'inadequacy',
					id: 'hovel',
					order: 700,
					func: function (x, me) {return x * .9}
				},
				{
					name: 'inadequacy',
					id: 'house',
					order: 700,
					func: function (x, me) {return x * .9}
				}
			],
			unlocks: ['optics']
		},
		guilds: {
			object_type: 'tech',
			title: 'Guilds',
			age: 2,
			locks: 2,
			description: 'Guilds systematize professions to better pass on professional knowledge to new generations.',
			announce: 'You can now build an academy that will increase the rate at which your occupations improve.',
			show_in: {tab: 'research', section: 'society'},
			time: 1,
			cost: {influence: 15, labour: 30, fabrications: 15, culture: 1.5},
			apply: function () {
				game.junction.unlock('social', 'professions');
			}
		},
		husbandry: {
			object_type: 'tech',
			title: 'Husbandry',
			age: 2,
			description: 'The study of animals including their structure, classification and reproduction.',
			announce: 'If your followers have two or more beasts at the end of an epoch, they will breed another.',
			show_in: {tab: 'research', section: 'technology'},
			time: 1,
			cost: {labour: 50, food: 50},
			fixed_cost: {/*beasts: 1*/},
			construct: function (me) {
				me.epoch = function () {
					if (game.allies.beasts.value>=2) {
						game.allies.beasts.value += 1
						game.log.add('Your followers breed a new beast.');
					}
				}
			},
			apply: function () {
				//game.each_aut.add_result(game.techs.husbandry.epoch)
			}
		},
		
//SCIENCES

		maps: {
			object_type: 'science',
			title: 'Cartography',
			description: 'Allows additional lands to be explored.',
			show_in: {tab: 'research', section: 'science'},
			locks: 1,
			time_function: function (me) {
				return (me.value+1) * Math.pow(1.1, me.value);
			},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1, 5) * 10,
					fabrications: 10,
					knowledge: 20 * (1 + me.value/2) * Math.pow(1.2, me.value)
				}
			},
			apply: function (me) {
				while (game.world.tiles.length <= me.value) game.world.make_tile();
			},
			unlocks: ['compass']
		},
		drama: {
			object_type: 'science',
			title: 'Drama and Poetry',
			description: 'Works that influence thoughts and feelings.<br>Increases the rate at which new followers arrive.',
			show_in: {tab: 'research', section: 'society'},
			locks: 1,
			time_function: function (me) {
				return 5 * (me.value + 1) * Math.pow(1.3, me.value)
			},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1, 5) * 10,
					fabrications: 10,
					knowledge: 100 * (me.value * 1/2 + 1) * Math.pow(1.2, me.value),
					culture: 10 * (me.value * 1/2 + 1) * Math.pow(1.2, me.value)
				}
			},
			mods: [
				{
					name: 'recruit_amount',
					id: 'humans',
					order: 400,
					func: function (x, me) {
						return x + me.value * .2
					}
				}
			],
			unlocks: ['hedonism']
		},
		encyclopedia: {
			object_type: 'science',
			title: 'Encyclopedia',
			locks: 1,
			description: 'Compendia of all-around knowledge.<br>These can be spent in place of ingenuity to reasearch new technologies.',
			show_in: {tab: 'research', section: 'science'},
			time_function: function (me) {
				return (me.value * 2 + 1);
			},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1, 5) * 10,
					fabrications: 10,
					knowledge: 100 + (10 * me.value * Math.pow(1.1, me.value))
				}
			},
			dosh: {
				id: 'encyclopedia',
				title: 'Encyclopedia'
			},
			construct: function (me) {
				//delete me.buy_object.substitutions.knowledge.encyclopedia;
			}
		},
		engineering: {
			object_type: 'science',
			title: 'Engineering',
			locks: 2,
			description: 'Producing physical solutions to real world problems.<br>The use of cranes allows easier construction of housing and storage buildings.',
			show_in: {tab: 'research', section: 'science'},
			time_function: function (me) {
				return Math.max(1, 3 * me.value) * Math.pow(1.3, me.value)
			},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1, 5) * 10,
					fabrications: 10,
					knowledge: 50 * (me.value * 2 + 1) * Math.pow(1.2, me.value)
				}
			},
			mods: [
				{
					name: 'effect',
					id: ['pulley'],
					order: 400,
					func: function (x, me) {
						return x + me.value
					}
				}
			],
			unlocks: ['masonry', 'determinism']
		},
		optics: {
			object_type: 'science',
			title: 'Optics',
			locks: 1,
			description: 'The study of light and lensmaking. Applications include better scouting when exploring.',
			show_in: {tab: 'research', section: 'science'},
			time_function: function (me) {
				return 2 * (me.value + 1) * Math.pow(1.3, me.value)
			},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1, 5) * 10,
					fabrications: 10,
					ore: 25 * (me.value / 2 + 1) * Math.pow(1.2, me.value),
					knowledge: 100 * (me.value / 2 + 1) * Math.pow(1.2, me.value)
				}
			},
			mods: [
				{
					name: 'discovery_quality',
					id: 'world',
					order: 400,
					func: function (x, me) {return x + .3 * me.value}
				}
			],
			apply: function () {
				game.techs.lenses.unlock({by: 'optics'});
			}
		},
		
//WORKS

	calendar: {
			object_type: 'work',
			title: 'Stone Calendar',
			description: 'Allows accurate tracking of the passage of time.',
			show_in: {tab: 'works', section: 'monuments'},
			cost_function: function () {return {labour: 5}},
			max_value: 1,
/*			construct: function (me) {
				me.show_time = function (args) {
					it.clock.format_time = H.t(args.time)
					it.clock.node.text.innerHTML = 'Epoch ' + it.clock.aut + '<br>Next Epoch: ' + it.clock.format_time;
				}
				me.increasing = function (args) {
					var me = args.parent;
					if (me.value==me.trend) me.tick_div.innerHTML = '(Holding steady)';
					else me.tick_div.innerHTML = '(' + (me.value<me.trend ? 'Rising' : 'Falling') + ' to ' + me.trend + ')'
				}
				me.corpse_decay = function (args) {
					var me = args.parent;
					if (me.value-me.max<=0) me.tick_div.innerHTML = '';
					else me.tick_div.innerHTML = '(Decay in ' + H.t(me.next_decay - me.counter) + ')'
				}
			},*/
			apply: function (me) {
				game.clock.html_time.style.display = 'block';
				game.resources.format_tick = function (value) {
					if (value == 0) return '';
					return '(' + game.format_number(value * game.clock.aut_length) + ' per Epoch)';
				}
			},
			upgrades: {

			}
		},
		bonfire: {
			object_type: 'work',
			title: 'Bonfire',
			description: 'Provides warms so your followers live longer when exposed to the elements.',
			show_in: {tab: 'works', section: 'monuments'},
			cost_function: function () {return {labour: 10, fabrications: 10}},
			max_value: 1,
			mods: [
				{
					id: 'exposure',
					name: 'hospitableness',
					order: 400,
					func: function bonfire_exposure (x, me) {return x + 2}
				}
			],
			unlocks: ['cooking', 'funeral_pyres']
		},
		pyramid: {
			object_type: 'work',
			title: 'Pyramid',
			description: 'A huge burial structure associated with unknown rituals.',
			show_in: {tab: 'works', section: 'monuments'},
			cost_function: function () {return {labour: 900, fabrications: 300, mausoleum: 15}},
			max_value: 1,
			installments: 3
		},
		hovel: {
			object_type: 'work',
			title: 'Hovel',
			description: 'Provides living space for one of your followers, though such wretched conditions can have ill effects.',
			show_in: {tab: 'works', section: 'buildings'},
			cvars: {inadequacy: 1/3},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value + 1, 5) *10,
					fabrications: 10 * (me.value + 1) * Math.pow(1.3, me.value)
				}
			},
			mods: [
				{
					id: 'humans',
					name: 'max',
					order: 400,
					func: function hovel_housing (x, me) {return x + me.value}
				},
				{
					id: 'disease',
					name: 'up_tick',
					order: 400,
					func: function hovel_disease_tick (x, me) {return x + me.value * me.inadequacy;}
				},
				{
					id: 'disease',
					name: 'max',
					order: 400,
					func: function hovel_disease_tick (x, me) {return x + me.value * me.inadequacy;}
				}
			]
		},
		house: {
			object_type: 'work',
			title: 'House',
			description: 'A significant improvement on the hovel that houses two followers with reduced disease exposure.',
			show_in: {tab: 'works', section: 'buildings'},
			cvars: {inadequacy: .6},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1,5) * 100,
					fabrications: 200 * (me.value/2 + 1) * Math.pow(1.15, me.value),
					hovel: 1
				}
			},
			substitutions: {hovel: {labour: .001}},
			mods: [
				{
					name: 'max',
					id: 'humans',
					order: 400,
					func: function house_housing (x, me) {
						return x + me.value * 2;
					}
				},
				{
					name: 'max',
					id: 'disease',
					order: 400,
					func: function house_disease (x, me) {
						return x + me.value * me.inadequacy;
					}
				},
				{
					name: 'up_tick',
					id: 'disease',
					order: 400,
					func: function house_disease_tick (x, me) {
						return x + me.value * me.inadequacy;
					}
				}
					
			],
			apply: function () {
				game.compute_cvar('hovel', 'cost');
			}
		},
		farm: {
			object_type: 'work',
			title: 'Farm',
			description: 'Stores food produced by farmers until harvest time. Harvests an average of 20 times per epoch.',
			cvars: {inadequacy: 1/6, max: 10},
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1,5) * 10,
					food: 8 * (me.value/4 + 1) * Math.pow(1.14, me.value),
					beasts: (me.value > 5 ? Math.floor((me.value-2)/4) : 0)
				}
			},
			mods: [
				{
					id: 'farming',
					name: 'max',
					order: 400,
					func: function farm_max (x, me) {
						return x + me.max * me.value
					}	
				},
				{
					name: 'max',
					id: 'disease',
					order: 400,
					func: function farm_disease_max (x, me) {
						return x + me.value * me.inadequacy
					}
				},
				{
					name: 'up_tick',
					id: 'disease',
					order: 400,
					func: function farm_disease_tick (x, me) {
						return x + me.value * me.inadequacy
					}
				}
			],
			construct: function (me) {
				me.html_capacity = HL.new_html('div');
				me.html_capacity.update = function () {
					me.html_capacity.innerHTML = 'Farm is at ' + Math.round(game.ids.farming.up_tick * game.clock.aut_length / game.ids.farming.max * 5) + '% worker capacity.';
				}
				me.ui.add(me.html_capacity);
			},
			unlocks: ['monitor_crops', 'yithira']
		},
		animal_pen: {
			object_type: 'work',
			title: 'Animal Pen',
			description: 'A home for one domesticated beast.',
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1,5) * 40,
					fabrications: 40 * (me.value * 2 + 1) * Math.pow(1.2, me.value)
				}
			},
			mods: [
				{
					name: 'max',
					id: 'beasts',
					order: 400,
					func: function (x, me) {
						return x + me.value
					}
				}
			],
			apply: function (me) {
				if (me.value>=3) game.unlock('husbandry');
			},
			unlocks: ['beasts']
		},
		apothecarys: {
			object_type: 'work',
			title: 'Apothecary\'s',
			description: 'A workshop to produce medicines.',
			cvars: {disease_reduction: 0.1, red_death_reduction: 0.1},
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1, 5) * 10,
					fabrications: 10 * (me.value/2 + 1) * Math.pow(1.15, me.value),
					knowledge: 7 * (me.value/2) * Math.pow(1.15, me.value)
				}
			},
			mods: [
				{
					name: 'up_tick',
					id: 'disease',
					order: 700,
					func: function (x, me) {
						return x / (1 + me.value * me.disease_reduction)
					}
				},
				{
					name: 'max',
					id: 'disease',
					order: 700,
					func: function (x, me) {
						return x / (1 + me.value * me.disease_reduction)
					}
				}
			]
		},
		armory: {
			object_type: 'work',
			title: 'Armory',
			cvars: {hunter_effect: 10},
			description: 'A workshop for producing weapons.',
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1,5) * 10,
					fabrications: 5 * (1 + me.value/2) * Math.pow(1.2, me.value-1)
				}
			},
			mods: [
				{
					name: 'food_effect',
					id: 'hunter',
					order: 400,
					func: function (x, me) {
						return x + me.value * me.hunter_effect
					}
				}
			]
		},
		idol: {
			object_type: 'work',
			title: 'Icon',
			description: 'Icons increase the amount of influence your worshippers produce.',
			show_in: {tab: 'works', section: 'buildings'},
			cost_function : function (me) {
				return {
					influence: 25 * (me.value + 0.5) * Math.pow(1.3, me.value),
					labour: Math.min(me.value+1, 5) * 20,
					fabrications: 5 * (me.value + 1) * Math.pow(1.05, me.value)
				}
			},
			mods: [
				{
					name: 'up_tick',
					id: 'influence',
					order: 400,
					func: function (x, me) {
						return x + me.value * 150;
					}
				},
				{
					name: 'efficiency',
					id: 'humans_worshipper',
					order: 400,
					func: function (x, me) {
						return x + 5 * me.value;
					}
				}
			],
			apply: function (me) {
				if (me.value>=1) game.unlock('babbling')
				if (me.value>=2) game.unlock('idolatry')
			}
		},
		shed: {
			object_type: 'work',
			title: 'Shed',
			description: 'Shoddily constructed storage space.',
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value + 1, 5) * 10,
					fabrications: 8 * (me.value/2 + 1) * Math.pow(1.22, me.value)
				}
			},
			mods: [
				{
					id: 'warehouse',
					name: 'max',
					order: 400,
					func: function shed_storage (x, me) {return x + me.value}
				}
			],
			unlocks: ['warehouse', 'warehousing']
		},
		storage: {
			object_type: 'work',
			title: 'Warehouse',
			description: 'Storage space to hold more resources.',
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1,5) * 100,
					fabrications: 200 * (me.value/2 + 1) * Math.pow(1.3, me.value)
				}
			},
			mods: [
				{
					name: 'max',
					id: 'warehouse',
					order: 400,
					func: function warehouse_storage (x, me) {
						return x + me.value * 2
					}
				}
			],
			unlocks: ['warehouse']
		},
		smelter: {
			object_type: 'work',
			title: 'Smelter',
			description: 'Lighter, stronger fabrications can be stored more efficiently in warehousing.',
			show_in: {tab: 'works', section: 'buildings'},
			cvars: {fabrication_storage_effect: 10},
			saves: ['processed_ore', 'fabrications'],
			installments: 2,
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1,5) * 40,
					fabrications: 35 * (me.value+1) * Math.pow(1.1, me.value),
					ore: 8 * (me.value/2+1) * Math.pow(1.15, me.value)
				}
			},
			mods: [
				{
					name: 'effect',
					id: 'warehousing',
					order: 400,
					func: function (x, me) {
						return x + me.value * me.fabrication_storage_effect;
					}
				}
			]
		},
		ironworks: {
			object_type: 'work',
			title: 'Ironworks',
			description: 'Increases the rate of production of fabrications.',
			cvars: {fabrication_production_effect: .15},
			show_in: {tab: 'works', section: 'buildings'},
			installments: 3,
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1 , 5) * 60,
					fabrications: 40 * (me.value*3/4+1) * Math.pow(1.15, me.value),
					ore: 10 * (me.value/2+1) * Math.pow(1.15, me.value)
				}
			},
			mods: [
				{
					name: 'up_tick',
					id: 'fabrications',
					order: 700,
					func: function ironworks_effect (x, me) {
						return x<=0 ? x : x * (1 + me.fabrication_production_effect * me.value);
					}
				}
			]
		},
		oracle: {
			object_type: 'work',
			title: 'Oracle',
			description: 'Strange vapours from the ground assist in predictions. This monument increases the number of epochs ahead that star signs can be seen in the heavens.',
			show_in: {tab: 'works', section: 'monuments'},
			cost_function: function (me) {
				return {
					influence: 25 * (me.value + 1) * Math.pow(1.25, me.value),
					labour: Math.min(me.value+1, 5) * 40,
					fabrications: 10 * (me.value + 1) * Math.pow(1.15, me.value)
				}
			},
			mods: [
				{
					name: 'foresight',
					id: 'pantheon',
					order: 400,
					func: function (x, me) {
						return x + me.value * 8
					}
				}
			]
		},
		mausoleum: {
			object_type: 'work',
			title: 'Mausoleum',
			description: 'A building that holds many graves for easy access.',
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					corpses: me.value+1,
					labour: Math.min(me.value+1,5) * 8, 
					fabrications: 5 * (me.value + 1) * Math.pow(1.05, me.value)
				}
			},
			mods: [
				{
					name: 'max',
					id: 'corpses',
					order: 400,
					func: function mausoleum_corpses (x, me) {
						return x + me.value
					}
				}
			],
			apply: function (me) {
				if (me.value>=3) game.unlock('grim_feast');
				if (me.value>=5) game.unlock('pyramid');
			}
		},
		trade_post: {
			object_type: 'work',
			title: 'Trade Post',
			description: 'A place to facilitate trade.',
			cvars: {research_boost: .1},
			show_in: {tab: 'works', section: 'buildings'},
			cost_function: function (me) {
				return {
					labour: Math.min(me.value+1, 5) * 30,
					fabrications: 100 * (me.value/4+1) * Math.pow(1.15, me.value),
					rarities: 1 * (me.value + 1) * Math.pow(1.15, me.value)
				}
			},
			mods: [
				{
					name: 'science_bonus',
					id: 'village',
					order: 400,
					func: function trade_post_research (x, me) {
						return x + me.research_boost * me.value;
					}
				}
			],
		},
		non_governance: {
			object_type: 'governance',
			title: 'No Interference',
			unlocked: true,
			hidden: true,
			prosperity: 0,
			science: 0,
			currency: 0,
			control: 0,
			trade: 1,
			culture: 1,
			cost_function: function (me) {
				return {
					culture: 5 * (me.value + 1) * Math.pow(1.4, me.value)
				}
			}
		},
		hedonism: {
			object_type: 'governance',
			title: 'Hedonism',
			locks: 2,
			description: 'Life should be dedicated to the pursuit of pleasure and the avoidance of suffering. Populations that live according to hedonism grow more quickly but produce substantially fewer scientific and cultural innovations. This philosophy is easy to impose.',
			prosperity: 0.10,
			science: -1/6,
			currency: 0,
			control: -75,
			trade: 1,
			culture: 1/3,
			show_in: {tab: 'social', section: 'philosophy'},
			cost_function: function (me) {
				return {
					culture: 5 * (me.value + 1) * Math.pow(1.4, me.value)
				}
			}
		},
		solipsism: {
			object_type: 'governance',
			title: 'Solipsism',
			locks: 2,
			description: 'The world is merely theatre taking place inside our own minds. Populations that live according to solipsism produce fewere scientific and cultural innovations but generate currency your followerse can embezzle. This philosophy is difficult to impose.',
			prosperity: 0,
			science: -1/6,
			currency: 20/3,
			control: 75,
			trade: 1,
			culture: 1/3,
			show_in: {tab: 'social', section: 'philosophy'},
			cost_function: function (me) {
				return {
					culture: 5 * (me.value + 1) * Math.pow(1.4, me.value)
				}
			}
		},
		mysticism: {
			object_type: 'governance',
			title: 'Mysticism',
			locks: 2,
			description: 'True understanding is beyond the power of the intellect. Populations that live according to mysticism produce almost nothing of value aside from cultural innovations. This philosphy is difficult to impose.',
			prosperity: -0.05,
			science: -1/6,
			currency: 0,
			control: 75,
			trade: 1,
			culture: 2,
			show_in: {tab: 'social', section: 'philosophy'},
			cost_function: function (me) {
				return {
					culture: 5 * (me.value + 1) * Math.pow(1.4, me.value)
				}
			}
		},
		stoicism: {
			object_type: 'governance',
			title: 'Stoicism',
			locks: 2,
			description: 'The good life is achieved by indifference to pleasure and pain. Populations that live according to stoicism grow faster and generate more science. This philosophy is difficult to impose.',
			prosperity: 0.05,
			science: 1/6,
			currency: 0,
			control: 75,
			trade: 1,
			culture: 1/2,
			show_in: {tab: 'social', section: 'philosophy'},
			cost_function: function (me) {
				return {
					culture: 5 * (me.value + 1) * Math.pow(1.4, me.value)
				}
			}
		},
		determinism: {
			object_type: 'governance',
			title: 'Determinism',
			locks: 2,
			description: 'All events are caused by action unrelated to choice and will. Populations that live according to determinism have low interest in culture but grow at an increased rate. This philosophy becomes easier to impose as it develops.',
			prosperity: 0.05,
			science: 0,
			currency: 0,
			control: 0,
			trade: 1,
			culture: 1/3,
			show_in: {tab: 'social', section: 'philosophy'},
			cost_function: function (me) {
				return {
					culture: 5 * (me.value + 1) * Math.pow(1.4, me.value)
				}
			}
		},
		lens: {
			object_type: 'landmark',
			title: 'The Dark Lens',
			chance: 0,
			icon: '&#10023;',
			description: 'The dark lens, through which you see this world.',
			unlocked: false
		},
		wilds: {
			object_type: 'landmark',
			title: 'Wilderness',
			chance: 1,
			production: {food: function (mark) {return 50}},
			cvars: {trapping_effect: 100},
			icon: '&#127795;',
			description: 'Lush wilds with many resources and wild beasts.',
			unlocked: true
		},
		mine: {
			object_type: 'landmark',
			title: 'Mineral Deposit',
			chance: 1,
			production: {ore: function (mark) {return (mark.depth+1)/2}},
			icon: '&#9968;',
			instance_data: {depth: 0},
			unlocked: true,
			widget_list: ['minery'],
			description: 'A place where useful subtances can be found in the earth.'
		},
		village: {
			object_type: 'landmark',
			title: 'Settlement',
			chance: 1,
			production: {culture: function (mark) {return mark.size}},
			icon: '&#9978;',
			instance_data: {size: 1},
			unlocked: true,
			description: 'An amalgom of humans who do not hear your whispers.',
			discover: ['civil_service']
		},
		yithira: {
			object_type: 'deity',
			title: 'Yithira',
			description: 'A cluster of stars resembling a hunched figure. Under the sign of Yithira crops do not flourish and the maximum food that can be held by farms is greatly reduced.',
			mods: [
				{
					name: 'max',
					id: 'farm',
					order: 700,
					func: function (x, me) {
						return x / 3;
					}
				}
			],
			sign_name: 'Sign of Yithira',
			sign_icon: '&#9793',
			sign_tooltip: 'Fields lie barren before him.'
		},
		red_death: {
			object_type: 'deity',
			title: 'The Red Death',
			description: 'A moon with a reddish tinge. Under the scarlet moon disease runs rampant.',
			delay: 1.5,
			unlocked: true,
			mods: [
				{
					name: 'up_tick',
					id: 'disease',
					order: 700,
					func: function (x, me) {return x * 4}
				},
				{
					name: 'max',
					id: 'disease',
					order: 700,
					func: function (x, me) {return x * 2.5}
				}
			],
			sign_name: 'Scarlet Moon',
			sign_icon: '&#9790',
			sign_tooltip: 'All things must end.'
		},
		mim_ktokh: {
			object_type: 'deity',
			title: 'Mim\'Ktokh',
			description: 'A ring of bright starts outlining a palpable darkness. Under the sign of Mim\'Ktokh time moves slowly.',
			delay: 2,
			unlocked: true,
			mods: [
				{
					name: 'dilation',
					id: 'clock',
					order: 700,
					func: function (x, me) {return x * 4}
				}
			],
			sign_name: 'Sign of Mim\'Ktokh',
			sign_icon: '&#9728',
			sign_tooltip: 'The eye of eternity.'
		},
		princess: {
			object_type: 'deity',
			title: 'Princess in Yellow',
			description: 'A sickly yellow moon. Under the pallid moon the princess attracts followers, leaving few for you.',
			delay: 1.5,
			unlocked: true,
			mods: [
				{
					name: 'up_tick',
					id: 'inveiglement',
					order: 700,
					func: function (x, me) {return 0}
				}
			],
			sign_name: 'Pallid Moon',
			sign_icon: '&#9789',
			sign_tooltip: 'All bow to her.'
		},
		tsatha: {
			object_type: 'deity',
			title: 'Tsatha',
			description: 'A group of stars resembling a tall, slender figure. Under the sign of Tsatha research is nearly impossible.',
			mods: [
				{
					name: 'effect',
					id: 'research',
					order: 700,
					func: function (x, me) {return x * .2}
				}
			],
			sign_name: 'Sign of Tsatha',
			sign_icon: '&#9799',
			sign_tooltip: 'Only madness in its sight.'
		},
		ukreyhu: {
			object_type: 'deity',
			title: 'Ukreyhu',
			description: 'Stars in the shape of a dancing figure. Under the sign of Ukreyhu production of labour and fabrications is greatly slowed.',
			unlocked: true,
			mods: [
				{
					name: 'labour_effect',
					id: 'labourer',
					order: 700,
					func: function (x, me) {return x * .15}
				},
				{
					name: 'fabrications_effect',
					id: 'manufacturer',
					order: 700,
					func: function (x, me) {return x * .15}
				}
			],
			sign_name: 'Sign of Ukreyhu',
			sign_icon: '&#9809;',
			sign_tooltip: 'The revels are endless before him.'
		},
		hisessifsiths: {
			object_type: 'deity',
			title: 'Hisessifsiths',
			description: 'A group of stars resembling a sleeping figure. Under the sign of Hisessifsiths projects in the world are nearly impossible to complete.',
			mods: [
				{
					name: 'effect',
					id: 'projects',
					order: 700,
					func: function (x, me) {return x * .2}
				}
			],
			sign_name: 'Sign of Hisessifsiths',
			sign_icon: '&#9796;',
			sign_tooltip: 'The mind dulls before her.'
		},
		doom: {
			object_type: 'omen',
			title: 'Omen of Doom',
			description: 'The people of the world are fearful and desperate for answers. People find their way to your fold much more quickly.',
			icon: '!',
			mods: [
				{
					name: 'up_tick',
					id: 'inveiglement',
					order: 700,
					func: function (x) {return x * 2 + (game.starchart.ominousness/2)}
				}
			],
			apply: function () {
				var d = Math.min(HL.r(3) + 1, game.specie.humans.value);
				var t = 'Omen of Doom!' + (d ? ' ' + d + ' of you followers perish.': '');
				game.log.add(t, 'big_death');
				game.species.adjust('humans', 0, 0, d);
				game.resources.adjust('corpses', d);
			},
			duration: 1/6
		},
		eternity: {
			object_type: 'omen',
			title: 'Omen of Eternity',
			description: 'Time rushes past without notice.',
			icon: '!',
			mods: [
				{
					name: 'dilation',
					id: 'clock',
					order: 700,
					func: function (x) {return x / (2 + game.starchart.ominousness/2)}
				}
			],
			duration: 1/6
		},
		reverie: {
			object_type: 'omen',
			title: 'Reverie',
			description: 'Your followers lose themselves, working day and night.',
			icon: '!',
			mods: [
				{
					name: 'count',
					ids: ['hunter', 'farmer', 'labourer', 'manufacturer', 'researcher'],
					order: 700,
					func: function (x) {return x * (2 + game.starchart.ominousness/2)}
				}
			],
			duration: 1/6
		},
		track_influence: {
			object_type: 'upgrade',
			host: 'calendar',
			title: 'Track Influence',
			description: 'Determine what your influence is trending towards.',
			cost: {knowledge: 5, influence: 10},
			apply: function () {
				game.resource.influence.format_tick = function (value, me) {
					var t = Math.round((value * game.clock.aut_length + me.current_decay) / (me.decay * 30));
					if (me.value == t) return '(Steady)';
					if (me.value < t) return '(Rising to '+t+')';
					return '(Falling to '+t+')'
				}
			},
			unlocked: 1
		},
		monitor_crops: {
			object_type: 'upgrade',
			host: 'calendar',
			title: 'Monitor Crops',
			description: 'Determine when the next harvest will come and how fruitful it will be.',
			cost: {knowledge: 15, influence: 20},
			apply: function (me) {
				me.html_timer = HL.new_html('div', game.info_table);
				function crop_tick () {
					me.html_timer.innerHTML = 'Next harvest: ' + game.ids.farming.value + ' ' + game.ids.food.title + ' in ' + game.timers.remain('harvest');
				};
				game.each_tick.push(crop_tick);
			}
		},
		time_corpse_rot: {
			object_type: 'upgrade',
			host: 'calendar',
			title: 'Time Corpse Rot',
			description: 'Show a timer indicating when the next corpse will rot.',
			cost: {knowledge: 5, corpses: 1},
			apply: function (me) {
				me.html_timer = HL.new_html('div', game.info_table);
				function corpse_rot_tick() {
					me.html_timer.innerHTML = (game.ids.corpses.value>game.ids.corpses.max) ? 'Next corpse rot: ' + game.timers.remain('rot') : '';
				}
				game.each_tick.push(corpse_rot_tick);
			}
		},
		time_research: {
			object_type: 'upgrade',
			host: 'calendar',
			title: 'Time Research',
			description: 'Show a timer indicating when your research will be complete.',
			cost: {knowledge: 25},
			apply: function (me) {
				me.html_timer = HL.new_html('div', game.info_table);
				function research_time() {
					me.html_timer.innerHTML = 'Research complete: ' + game.research.remain();
				}
				game.each_tick.push(research_time);
			}
		},
		/*study_efficiency: {
			object_type: 'upgrade',
			host: 'calendar',
			title: 'Study Worker Efficiency',
			description: 'Show the efficiency of workers as they are assigned.',
			cost: {labour: 10, knowledge: 5},
			apply: function (me) {
				var i;
				for (i in it.species) {
					it.species[i].show_efficiency=true;
				}
			},
			unlocked: 1
		},*/
		funeral_pyres: {
			object_type: 'upgrade',
			host: 'bonfire',
			title: 'Funeral Pyres',
			description: 'Show a method of reducing the entropic aura of the rotting dead.',
			cost: {fabrications: 5, corpses: 1},
			unlocks: ['pyres']
		},
		explore_tile: {
			object_type: 'project',
			title: 'Explore',
			description: 'Explore a new area, creating a new map or replacing an old map with a new one.',
			cant_do: 'Select a map tile.',
			disable_if: function (me) {
				if (game.world.selected.type||game.world.selected.number===0) return true;
				return false;
			},
			show_in: {tab: 'exploration', section: 'exploration'},
			time: 2,
			apply: function (me) {
				game.world.discover_tile(me.target);
			}
		},
		dig_mine: {
			object_type: 'project',
			title: 'Dig Mine',
			description: 'Dig deeper into the earth to find more riches.',
			cant_do: 'Select a mineral deposit or mine.',
			disable_if: function (me) {
				if (game.world.selected.type!='mine') return true;
				return false;
			},
			show_in: {tab: 'exploration', section: 'mining'},
			time: 0.5,
			apply: function (me) {
				me.target.depth ++;
			}
		},
	},
}
$cheat_time = game.create_mod(game, 'clock', 'dilation', function (x) {return x/10}, 700)
$cheat_world = function () {
	game.world.unlock();
	game.world.make_tile();
	game.world.discover_tile(game.world.tiles[0]);
}
$star_test = function () {
	game.starchart.unlock();
	game.starchart.create_sign();
	game.starchart.signs[0].time = 1.53;
}

game.test_function = function (r, f, a, b, c, d) {
	var t = new Date().getTime();
	for (var i = 0; i<r; i++) f(a, b, c, d)
	return new Date().getTime() - t;
}

game.resources.adjust('will', 100);
game.unlock('will');

//game.starchart.fill_with_stars();
game.world.make_starting_tile();

game.log.logs.all.click_me();
game.clock.start();
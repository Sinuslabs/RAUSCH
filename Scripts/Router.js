	namespace Router {

	const routes = Content.getAllComponents('_Route');
	const routerBtns = Content.getAllComponents('_router');

	const var bgImage = Content.getComponent("Background");
	bgImage.loadImage("{PROJECT_FOLDER}Assets/v3.png", "main");
	bgImage.loadImage("{PROJECT_FOLDER}Assets/about.png", "about");
	bgImage.setImage("main", 0, 0);

	inline function on_routerBtn(component, value) {
		if (value) {
			if (component.get('text') == currentRoute && previousRoute != '') {
				for (i = 0; i < routerBtns.length; i++) {
					if (routerBtns[i].get('text') == previousRoute) {
						routerBtns[i].setValue(1);
						routerBtns[i].changed();
						return;
					}
				}
			}

			Router.goTo(component.get('text'));
		}
	};


	reg currentRoute = 'Main';
	reg previousRoute = '';

	goTo(currentRoute);

	for (route in routes) {
		Console.print(route.getId());
	
		route.setPaintRoutine(function (g) {
		});
	}

	inline function goTo(goToRoute) {

		local toRoute = goToRoute;

		if (!toRoute) return;

		if (toRoute == 'Main') {
			bgImage.setImage("main", 0, 0);
			DotVideo.stop();
		} else {
			bgImage.setImage("about", 0, 0);
			
						DotVideo.play();
		}

		if (toRoute == 'back') {
			if (previousRoute != '') {
				toRoute = previousRoute;
			} else {
				return; // No previous route to go back to
			}
		}

		if (toRoute == currentRoute) return;

		for (route in routes) {
			if (route.getId().contains(toRoute)) {
				previousRoute = currentRoute;
				currentRoute = toRoute;
				route.set('visible', true);
			} else {
				route.set('visible', false);
			}
		}
	}

	inline function goToPrev() {
		if (previousRoute != '') {
			goTo(previousRoute);
		}
	}
}
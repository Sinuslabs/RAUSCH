	namespace Router {

	const routes = Content.getAllComponents('_Route');
	const routerBtns = Content.getAllComponents('_router');

	const var bgImage = Content.getComponent("bg");

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
	
	
    Engine.loadImageIntoPool('{PROJECT_FOLDER}Assets/v3.png');
    Engine.loadImageIntoPool('{PROJECT_FOLDER}Assets/about.png');


	reg currentRoute = 'Main';
	reg previousRoute = '';

	goTo(currentRoute);

	for (route in routes) {
		Console.print(route.getId());
	
		route.setPaintRoutine(function (g) {
		});
	}

	Engine.loadImageIntoPool('filename');
	
	inline function goTo(goToRoute) {
		
		local toRoute = goToRoute;

		if (!toRoute) return;
		
		if (toRoute == 'Main') {
			bgImage.set('fileName', '{PROJECT_FOLDER}Assets/v3.png');
		} else {
		
			bgImage.set('fileName', '{PROJECT_FOLDER}Assets/about.png');
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
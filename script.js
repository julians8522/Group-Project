/* 
    Javascript Group Project

    Authors: Brit, Julian, Michael

*/
//global variables
const absEnd = "https://ipgeolocation.abstractapi.com/v1/?api_key=e200bac17db8464584867ff0166e5641";
const drinkByState = { AL: "Bellini", AK: "White Russian", AZ: "Jack and Coke", AR: "Mojito", CA: "Paloma", CO: "Mimosa", CT: "Coquito", DE: "Manhattan", FL: "Pina Colada", GA: "Mimosa", HI: "Mai Tai", ID: "Hot Buttered Rum", IL: "Mimosa", IN: "Tequila Sunrise", IA: "Fuzzy Navel", KS: "Wine Cooler", KY: "Wine Cooler", LA: "Daiquiri", ME: "Rusty Nail", MD: "Mimosa", MA: "Painkiller", MI: "7 and 7", MN: "White Russian", MS: "Old Fashioned", MO: "Margarita", MT: "Dark N' Stormy", NE: "Moscow Mule", NV: "Shirley Temple", NH: "Margarita", NJ: "Pina Colada", NM: "Piña Colada", NY: "Vodka Fizz", NC: "Mimosa", ND: "Sex on the Beach", OH: "SHANDY", OK: "Bellini", OR: "Lemon Drop Martini", PA: "Wine Cooler", RI: "Dark N' Stormy", SC: "Gin Fizz", SD: "Screwdriver", TN: "Mimosa", TX: "Margarita", UT: "Rickey", VT: "Cosmopolitan", VA: "Mojito", WA: "Mojito", WV: "White Russian", WI: "Old Fashioned", WY: "Long Island Iced Tea" };
let defaultDrink;
let state, stateCode;
let popList = [];

window.addEventListener("load", loadEvents);

//creates event listeners and performs other actions when page loads
async function loadEvents() {
	const resp = await fetch(absEnd);
	const obj = await resp.json();
	state = obj.region_iso_code;
	let drink = drinkByState[state];

	if (document.getElementById("randBtn")) {
		//if the document has the random drink button
		fillThumb();
	}
	if (document.getElementById("drinkContainer")) {
		await fillInfo(drink);
		for (let i = 0; i < document.getElementById("popList").children.length; i++) {
			document.getElementById("popList").children[i].addEventListener("click", updatePopular);
		}
	}
}

//update popular page with new info based which drink is clicked
function updatePopular(evt) {
	let drink, name, img, type, glass, instruction;
	for (let i = 0; i < popList.length; i++) {
		if (evt.target.innerText === popList[i].strDrink) {
			drink = popList[i];
		}
	}
	drId = drink.idDrink;
	name = drink.strDrink;
	img = drink.strDrinkThumb;
	type = drink.strAlcoholic;
	glass = drink.strGlass;
	instruction = drink.strInstructions;

	fillIng(drink);

	document.getElementById("drinkName").innerText = name;
	document.getElementById("type").innerText = type;
	document.getElementById("glass").innerText = glass;
	document.getElementById("instructions").innerText = instruction;
	document.getElementById("img").setAttribute("src", img);
}

//decode uint8
function Decodeuint8arr(uint8array) {
	return new TextDecoder("utf-8").decode(uint8array);
}

//function to get a random cocktail image to fill into thumbnails
function fillThumb() {
	//fetch a random drink
	fetch("https://the-cocktail-db.p.rapidapi.com/random.php", {
		method: "GET",
		headers: {
			"x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
			"x-rapidapi-key": "8ce3a20de4msh15f5b95429d72f4p184767jsn43b2ad9e2651",
		},
	})
		.then((response) => {
			return response.body;
		})
		// obtained on 1/19/22 at https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
		.then((body) => {
			const reader = body.getReader();
			return new ReadableStream({
				start(controller) {
					return pump();

					function pump() {
						return reader.read().then(({ done, value }) => {
							// When no more data needs to be consumed, close the stream
							if (done) {
								controller.close();
								return;
							}
							// Enqueue the next data chunk into our target stream
							const data = JSON.parse(Decodeuint8arr(value));
							console.log(data);
							let randImg = data.drinks[0].strDrinkThumb;
							document.getElementById("randBtn").setAttribute("src", randImg);
							randInfo = data.drinks[0].idDrink; //store drink id in case visitor wants more info
							return pump();
						});
					}
				},
			});
		})
		.catch((err) => {
			console.error(err);
		});
	//fetch a list of popular drinks
	fetch("https://the-cocktail-db.p.rapidapi.com/popular.php", {
		method: "GET",
		headers: {
			"x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
			"x-rapidapi-key": "8ce3a20de4msh15f5b95429d72f4p184767jsn43b2ad9e2651",
		},
	})
		.then((response) => {
			return response.body;
		})
		// obtained on 1/19/22 at https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
		.then((body) => {
			const reader = body.getReader();
			return new ReadableStream({
				start(controller) {
					return pump();

					function pump() {
						return reader.read().then(({ done, value }) => {
							// When no more data needs to be consumed, close the stream
							if (done) {
								controller.close();
								return;
							}
							// Enqueue the next data chunk into our target stream
							const data = JSON.parse(Decodeuint8arr(value));
							console.log(data);
							let recImg = data.drinks[0].strDrinkThumb;
							document.getElementById("recBtn").setAttribute("src", recImg);
							recInfo = data.drinks[0].idDrink; //store drink id in case visitor wants more info
							fillCard(recInfo);
							return pump();
						});
					}
				},
			});
		})
		.catch((err) => {
			console.error(err);
		});
}

//150 lines of some innefficient code filling ingredient list
function fillIng(drink) {
	//clear out any previous list before filling with new ingredients
	document.getElementById("ingList").innerHTML = "";
	//1st ingredient
	if (drink.strIngredient1) {
		let ing1 = document.createElement("li");
		if (drink.strMeasure1) {
			ing1.innerText = `${drink.strMeasure1} ${drink.strIngredient1}`;
		} else {
			ing1.innerText = drink.strIngredient1;
		}
		document.getElementById("ingList").appendChild(ing1);
	}
	//2nd ingredient
	if (drink.strIngredient2) {
		let ing2 = document.createElement("li");
		if (drink.strMeasure2) {
			ing2.innerText = `${drink.strMeasure2} ${drink.strIngredient2}`;
		} else {
			ing2.innerText = drink.strIngredient2;
		}
		document.getElementById("ingList").appendChild(ing2);
	}
	//3rd ingredient
	if (drink.strIngredient3) {
		let ing3 = document.createElement("li");
		if (drink.strMeasure3) {
			ing3.innerText = `${drink.strMeasure3} ${drink.strIngredient3}`;
		} else {
			ing3.innerText = drink.strIngredient3;
		}
		document.getElementById("ingList").appendChild(ing3);
	}
	//4th ingredient
	if (drink.strIngredient4) {
		let ing4 = document.createElement("li");
		if (drink.strMeasure1) {
			ing4.innerText = `${drink.strMeasure4} ${drink.strIngredient4}`;
		} else {
			ing4.innerText = drink.strIngredient4;
		}
		document.getElementById("ingList").appendChild(ing4);
	}
	//5th ingredient
	if (drink.strIngredient5) {
		let ing5 = document.createElement("li");
		if (drink.strMeasure5) {
			ing5.innerText = `${drink.strMeasure5} ${drink.strIngredient5}`;
		} else {
			ing5.innerText = drink.strIngredient5;
		}
		document.getElementById("ingList").appendChild(ing5);
	}
	//6th ingredient
	if (drink.strIngredient6) {
		let ing6 = document.createElement("li");
		if (drink.strMeasure6) {
			ing6.innerText = `${drink.strMeasure6} ${drink.strIngredient6}`;
		} else {
			ing6.innerText = drink.strIngredient6;
		}
		document.getElementById("ingList").appendChild(ing6);
	}
	//7th ingredient
	if (drink.strIngredient7) {
		let ing7 = document.createElement("li");
		if (drink.strMeasure7) {
			ing7.innerText = `${drink.strMeasure7} ${drink.strIngredient7}`;
		} else {
			ing7.innerText = drink.strIngredient7;
		}
		document.getElementById("ingList").appendChild(ing7);
	}
	//8th ingredient
	if (drink.strIngredient8) {
		let ing8 = document.createElement("li");
		if (drink.strMeasure8) {
			ing8.innerText = `${drink.strMeasure8} ${drink.strIngredient8}`;
		} else {
			ing8.innerText = drink.strIngredient8;
		}
		document.getElementById("ingList").appendChild(ing8);
	}
	//9th ingredient
	if (drink.strIngredient9) {
		let ing9 = document.createElement("li");
		if (drink.strMeasure9) {
			ing9.innerText = `${drink.strMeasure9} ${drink.strIngredient9}`;
		} else {
			ing9.innerText = drink.strIngredient9;
		}
		document.getElementById("ingList").appendChild(ing9);
	}
	//10th ingredient
	if (drink.strIngredient10) {
		let ing10 = document.createElement("li");
		if (drink.strMeasure10) {
			ing10.innerText = `${drink.strMeasure10} ${drink.strIngredient10}`;
		} else {
			ing10.innerText = drink.strIngredient10;
		}
		document.getElementById("ingList").appendChild(ing10);
	}
	//11th ingredient
	if (drink.strIngredient11) {
		let ing11 = document.createElement("li");
		if (drink.strMeasure11) {
			ing11.innerText = `${drink.strMeasure11} ${drink.strIngredient11}`;
		} else {
			ing11.innerText = drink.strIngredient11;
		}
		document.getElementById("ingList").appendChild(ing11);
	}
	//12th ingredient
	if (drink.strIngredient2) {
		let ing12 = document.createElement("li");
		if (drink.strMeasure12) {
			ing12.innerText = `${drink.strMeasure12} ${drink.strIngredient12}`;
		} else {
			ing12.innerText = drink.strIngredient12;
		}
		document.getElementById("ingList").appendChild(ing12);
	}
	//13th ingredient
	if (drink.strIngredient13) {
		let ing13 = document.createElement("li");
		if (drink.strMeasure13) {
			ing13.innerText = `${drink.strMeasure13} ${drink.strIngredient13}`;
		} else {
			ing13.innerText = drink.strIngredient13;
		}
		document.getElementById("ingList").appendChild(ing1);
	}
	//14th ingredient
	if (drink.strIngredient14) {
		let ing14 = document.createElement("li");
		if (drink.strMeasure14) {
			ing14.innerText = `${drink.strMeasure14} ${drink.strIngredient14}`;
		} else {
			ing14.innerText = drink.strIngredient14;
		}
		document.getElementById("ingList").appendChild(ing14);
	}
	//15th ingredient
	if (drink.strIngredient15) {
		let ing15 = document.createElement("li");
		if (drink.strMeasure15) {
			ing15.innerText = `${drink.strMeasure15} ${drink.strIngredient15}`;
		} else {
			ing15.innerText = drink.strIngredient15;
		}
		document.getElementById("ingList").appendChild(ing15);
	}
}

//fill a card with info on a drink
async function fillInfo(dr) {
	let drink, name, img, type, glass, instruction;
	document.getElementById("ingList").innerHTML = "";
	//fetch a list of popular drinks
	fetch("https://the-cocktail-db.p.rapidapi.com/popular.php", {
		method: "GET",
		headers: {
			"x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
			"x-rapidapi-key": "8ce3a20de4msh15f5b95429d72f4p184767jsn43b2ad9e2651",
		},
	})
		.then((response) => {
			return response.json();
		})
		.then(async function (obj) {
			popList = obj.drinks;
			for (let i = 0; i < popList.length; i++) {
				let li = document.createElement("li");
				li.innerHTML = `<a href=#>${popList[i].strDrink}</a>`;
				li.style.border = "3px solid navy";
				li.style.margin = "5px";
				li.addEventListener("click", updatePopular);
				document.getElementById("popList").appendChild(li);
			}
			if (dr) {
				drink = await search(dr);
			}
			if (drink === null) {
				drink = popList[0];
			}

			name = drink.strDrink;
			img = drink.strDrinkThumb;
			type = drink.strAlcoholic;
			glass = drink.strGlass;
			instruction = drink.strInstructions;

			fillIng(drink);

			document.getElementById("drinkName").innerText = name;
			document.getElementById("type").innerText = type;
			document.getElementById("glass").innerText = glass;
			document.getElementById("instructions").innerText = instruction;
			document.getElementById("img").setAttribute("src", img);
		})
		.catch((err) => {
			console.error(err);
		});
}


//search for a drink by name, returns drink object
async function search(drinkName) {
	fetch(absEnd)
		.then((resp) => resp.json())
		.then(function (obj) {
			state = obj.region;
			stateCode = obj.region_iso_code;
		});
	const response = await fetch(`https://rapidapi.p.rapidapi.com/search.php?s=${drinkName}`, { method: "GET", headers: { "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com", "x-rapidapi-key": "8ce3a20de4msh15f5b95429d72f4p184767jsn43b2ad9e2651" } });
	const data = await response.json();
	return data.drinks[0];
}

//sleep function for short delay
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


//function to create shopping list cookie
function createCookie(name, value) {
	//adds a cookie to the document with a given name and value
	//can also be used to update a cookie
	document.cookie = `${name}=${value};`;
}

//function that uses cookies to recreate list
function getCookie(name) {
	//create an array of each cookie
	let cookieArray = document.cookie.split(";");
	//loop through array
	for (let i = 0; i < cookieArray.length; i++) {
		let pair = cookieArray[i].split("="); //splits string into 2 elements, the name and value
		if (pair[0].trim() === name) {
			//if the name is the same as the search query
			return pair[1].trim(); //returns value of cookie
		}
	}
	return null; //null if provided name is not in cookie
}

//function to delete a cookie when given a name
function deleteCookie(name) {
	//sets value of cookie with name to nothing, and sets max-age to 0 so it deletes
	document.cookie = `${name}=; max-age=0`;
}

//grabs available search terms and print as checklist
const printOptions = () => {
	const container = document.getElementById("selection_container");
	fetch("https://the-cocktail-db.p.rapidapi.com/list.php?i=list", {
		method: "GET",
		headers: {
			"x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
			"x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a",
		},
	}) //grab all ingredients
		.then((response) => {
			console.log(response);
		})
		.catch((err) => {
			console.error(err);
		});
};

const fetchSearch = () => {
	//grabs selected data and sends it to printCarousel
	const checkboxes = document.getElementsByClassName("checkbox");
	const numBoxes = checkboxes.length();
	let searchParams = [];
	for (let i = 0; i < numBoxes; i++) {
		//look at each check box, if it's checked add it to params
		let currentCheckbox = checkboxes[i];
		if (currentCheckbox.checked) {
			searchParams.push(currentCheckbox.innerText);
		}
	}
	//turn params into fetch query format
	const numParams = searchParams.length();
	let formattedParam = `i=${searchParams[0]}`;
	for (let i = 0; i < numParams; i++) {
		formattedParam += `%2C${searchParams[i]}`;
	}
	//check if wants alcholic drink
	const isAlcoholic = document.getElementById("alcohol_box").checked;
	if (isAlcoholic) {
		formattedParam += "a=Alcoholic";
	} else {
		formattedParam += "a=Non-Alcoholic";
	}
	//check if wants cocktail or normal drink
	const isCocktail = document.getElementById("cocktail_box").checked;
	const isNotCocktail = document.getElementById("without_cocktail_box").checked;
	if (isCocktail && isNotCocktail) {
		//ignore for both otherwise add respective param
	} else if (isCocktail) {
		formattedParam += "c=Cocktail";
	} else if (isNotCocktail) {
		formattedParam += "c=Ordinary_Drink";
	}
	//fetch time
	fetch(`https://the-cocktail-db.p.rapidapi.com/filter.php?${formattedParam}`, {
		method: "GET",
		headers: {
			"x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
			"x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a",
		},
	})
		.then((response) => {
			printCarousel(response.drinks); // call next function with data
		})
		.catch((err) => {
			console.error(err);
		});
};

//print the carousel
const printCarousel = (objArr) => {
	for (let i = 0; i < objArr.length(); i++) {
		if (objArr[i]) {
			//if it exists print it
			let drinkId, drinkName, drinkCategory, drinkTags, drinkInstructionsEN, drinkImageSource;
			let drinkIngredients,
				drinkAmounts = [];
			//lookup by id for full details
			fetch(`https://the-cocktail-db.p.rapidapi.com/lookup.php?i=${objArr[i].idDrink}`, {
				method: "GET",
				headers: {
					"x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
					"x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a",
				},
			})
				.then((response) => {
					return response.drinks[i]; //grab respective drink object
				})
				.then((data) => {
					// destructure array
					drinkId = data.idDrink;
					drinkName = data.strDrink;
					drinkTags = data.strTags;
					drinkCategory = data.strCategory;
					drinkInstructionsEN = data.strInstructions;
					drinkImageSource = data.strImageSource;
					for (let i = 0; i < 15; i++) {
						const ingredientPath = `data.strIngredient${i}`;
						const curIngr = eval(ingredientPath);
						if (curIngr) {
							drinkIngredients[i] = curIngr; //add drink ingredients if they exist
						}
						const amountPath = `data.strMeasure${i}`;
						const curAmt = eval(amountPath);
						if (curAmt) {
							drinkAmounts[i] = curAmt; //add amount of ingredient if they exist
						}
					}
				})
				.catch((err) => {
					console.error(err);
				});
			//actually print to the carousel card
			//curCard.children[2].innerText = drinkInstructionsEN
			const container = document.getElementById("carousel_item_container");
			container.innerHTML = `<div class="carousel-item col-12 col-sm-6 col-md-4 col-lg-3 active">
                <img src="${drinkImageSource}" class="img-fluid mx-auto d-block" alt="${drinkName}">
             <p>${drinkInstructionsEN}</p>
             </div>`;
			//printIngredients(drinkIngredients, drinkAmounts)
			//Carousel Event listener
			$("#carousel-example").on("slide.bs.carousel", function (e) {
				/*
                    CC 2.0 License Iatek LLC 2018 - Attribution required
                    obtained on 1/19/22 at https://azmind.com/bootstrap-carousel-multiple-items/
                */
				var $e = $(e.relatedTarget);
				var idx = $e.index();
				var itemsPerSlide = 5;
				var totalItems = $(".carousel-item").length;

				if (idx >= totalItems - (itemsPerSlide - 1)) {
					var it = itemsPerSlide - (totalItems - idx);
					for (var i = 0; i < it; i++) {
						// append slides to end
						if (e.direction == "left") {
							$(".carousel-item").eq(i).appendTo(".carousel-inner");
						} else {
							$(".carousel-item").eq(0).appendTo(".carousel-inner");
						}
					}
				}
			});
		}
	}
};

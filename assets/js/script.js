/* 
    Javascript Group Project

    Authors: Brit, Julian, Michael

*/
//global variables
const absEnd = "https://ipgeolocation.abstractapi.com/v1/?api_key=e200bac17db8464584867ff0166e5641";
const drinkByState = {
    AL: "Bellini",
    AK: "White Russian",
    AZ: "Jack and Coke",
    AR: "Mojito",
    CA: "Paloma",
    CO: "Mimosa",
    CT: "Coquito",
    DE: "Manhattan",
    FL: "Pina Colada",
    GA: "Mimosa",
    HI: "Mai Tai",
    ID: "Hot Buttered Rum",
    IL: "Mimosa",
    IN: "Tequila Sunrise",
    IA: "Fuzzy Navel",
    KS: "Wine Cooler",
    KY: "Wine Cooler",
    LA: "Daiquiri",
    ME: "Rusty Nail",
    MD: "Mimosa",
    MA: "Painkiller",
    MI: "7 and 7",
    MN: "White Russian",
    MS: "Old Fashioned",
    MO: "Margarita",
    MT: "Dark N' Stormy",
    NE: "Moscow Mule",
    NV: "Shirley Temple",
    NH: "Margarita",
    NJ: "Pina Colada",
    NM: "Piña Colada",
    NY: "Vodka Fizz",
    NC: "Mimosa",
    ND: "Sex on the Beach",
    OH: "SHANDY",
    OK: "Bellini",
    OR: "Lemon Drop Martini",
    PA: "Wine Cooler",
    RI: "Dark N' Stormy",
    SC: "Gin Fizz",
    SD: "Screwdriver",
    TN: "Mimosa",
    TX: "Margarita",
    UT: "Rickey",
    VT: "Cosmopolitan",
    VA: "Mojito",
    WA: "Mojito",
    WV: "White Russian",
    WI: "Old Fashioned",
    WY: "Long Island Iced Tea"
};
let defaultDrink;
let state, stateCode;
let popList = [];

window.addEventListener("load", (evt) => {
    loadEvents()
});

//@thirdparty
//third party functions with their credits
//Carousel Event listener
//obtained on 1/19/22 at https://azmind.com/bootstrap-carousel-multiple-items/
function carouselEventListeners() {

    $('#carousel-example').on('slide.bs.carousel', function (e) {
        /*
            CC 2.0 License Iatek LLC 2018 - Attribution required
        */
        var $e = $(e.relatedTarget);
        var idx = $e.index();
        var itemsPerSlide = 5;
        var totalItems = $('.carousel-item').length;

        if (idx >= totalItems - (itemsPerSlide - 1)) {
            var it = itemsPerSlide - (totalItems - idx);
            for (var i = 0; i < it; i++) {
                // append slides to end
                if (e.direction == "left") {
                    $('.carousel-item').eq(i).appendTo('.carousel-inner');
                } else {
                    $('.carousel-item').eq(0).appendTo('.carousel-inner');
                }
            }
        }

    });

}

//@events
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
    if (document.getElementById("ingredient_box")) {
        printOptions();
    }
    if (document.getElementById("selection_container")) {
        document.getElementById("selection_container").addEventListener("submit", (evt) => {
            evt.preventDefault()
            fetchSearch(formatQuery());
            document.getElementById("selection_container").reset()
        })
    }
}

//RIP COOKIES
//update popular page with new info based which drink is clicked
function updatePopular(evt) {
    let drink, name, img, type, glass, instruction;
    let drinkIngredients = [];
    let drinkAmounts = []
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
    for (let t = 1; t < 16; t++) {
        let ingredientPath = `data.strIngredient${t}`
        if (eval(ingredientPath)) {
            const curIngr = eval(ingredientPath)
            drinkIngredients[t - 1] = curIngr //add drink ingredients if they exist
        }
        const amountPath = `data.strMeasure${t}`
        const curAmt = eval(amountPath)
        if (curAmt) {
            drinkAmounts[t - 1] = curAmt //add amount of ingredient if they exist
        }
    }
    printIngredients(drinkIngredients, drinkAmounts)
    document.getElementById("drinkName").innerText = name;
    document.getElementById("type").innerText = type;
    document.getElementById("glass").innerText = glass;
    document.getElementById("instructions").innerText = instruction;
    document.getElementById("img").setAttribute("src", img);
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
            return response.json();
        })
        .then((body) => {
            const data = body.drinks;
            let randImg = data[0].strDrinkThumb;
            document.getElementById("randBtn").setAttribute("src", randImg);
            randInfo = data[0].idDrink; //store drink id in case visitor wants more info
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
            return response.json();
        })
        .then((body) => {
            const data = body.drinks
            let recImg = data[0].strDrinkThumb;
            document.getElementById("recBtn").setAttribute("src", recImg);
            recInfo = data[0].idDrink; //store drink id in case visitor wants more info
            fillCard(recInfo);
        })
        .catch((err) => {
            console.error(err);
        });
}
//fill a card with info on a drink
async function fillInfo(dr) {
    let drink, name, img, type, glass, instruction;
    let drinkAmounts = [];
    let drinkIngredients = []
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

            for (let t = 1; t < 16; t++) {
                let ingredientPath = `drink.strIngredient${t}`
                if (eval(ingredientPath)) {
                    const curIngr = eval(ingredientPath)
                    drinkIngredients[t - 1] = curIngr //add drink ingredients if they exist
                }
                const amountPath = `drink.strMeasure${t}`
                const curAmt = eval(amountPath)
                if (curAmt) {
                    drinkAmounts[t - 1] = curAmt //add amount of ingredient if they exist
                }
            }
            printIngredients(drinkIngredients, drinkAmounts);

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
    const response = await fetch(`https://rapidapi.p.rapidapi.com/search.php?s=${drinkName}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
            "x-rapidapi-key": "8ce3a20de4msh15f5b95429d72f4p184767jsn43b2ad9e2651"
        }
    });
    const data = await response.json();
    return data.drinks[0];
}

//sleep function for short delay
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


//@options
//grabs available search terms and print as checklist
const printOptions = () => {
    //fetch ingredients
    fetch("https://the-cocktail-db.p.rapidapi.com/list.php?i=list", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
                "x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a"
            }
        })
        // obtained on 1/19/22 at https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
        .then(response => {
            return response.json()
        })
        .then(body => {
            const data = body.drinks
            const ingredientBox = document.getElementById("ingredient_box")
            for (let i = 0; i < data.length; i++) { //for each ingredient in each array add html for an option
                const ingredient = eval(`data[${i}].strIngredient1`)
                ingredientBox.innerHTML += `
                                <option value="${ingredient}">${ingredient}</option>`
            }
            ingredientBox.fstdropdown.rebind();
        })
        .catch(err => console.error(err));
    //fetch available categories
    fetch("https://the-cocktail-db.p.rapidapi.com/list.php?c=list", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
                "x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a"
            }
        })
        // obtained on 1/19/22 at https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
        .then(response => {
            return response.json()
        })
        .then(body => {
            const data = body.drinks
            const categoryBox = document.getElementById("category_box")
            for (let i = 0; i < data.length; i++) { //for each category in each array add html for an option
                const category = eval(`data[${i}].strCategory`)
                categoryBox.innerHTML += `
                                <option value="${category}">${category}</option>`
            }
            categoryBox.fstdropdown.rebind();
        })
        .catch(err => console.error(err));
}
//grab parameters and format them into a query
const formatQuery = () => {
    const container = document.getElementById("selection_container")
    //grab ingredients
    const ingredientArray = container.children[0].children[3].selectedOptions
    let searchParams = []
    for (let i = 0; i < ingredientArray.length; i++) {
        if (ingredientArray[i] !== "") {
            searchParams[i] = ingredientArray[i].innerText
        }
    }
    //turn ingredients into query
    let formattedParam = `i=${searchParams[0]}`
    for (let i = 1; i < searchParams.length; i++) {
        formattedParam += `%2C${searchParams[i]}`
    }
    //grab category
    const categoryVal = container.children[0].children[2].value
    if (categoryVal) {
        formattedParam + -`&c=${categoryVal}`
    }


    //check if wants alcholic drink
    const isAlcoholic = document.getElementById("alcohol_box").checked
    if (isAlcoholic) {
        formattedParam += "&a=Alcoholic"
    } else {
        formattedParam += "&a=Non-Alcoholic"
    }
    //check if wants cocktail or normal drink
    const isCocktail = document.getElementById("cocktail_box").checked
    if (isCocktail) {
        formattedParam += "&c=Cocktail"
    } else {
        formattedParam += "&c=Ordinary_Drink"
    }
    return formattedParam
}

//@search
const fetchSearch = (formattedParam) => { //grabs selected data and sends it to printCarousel
    //fetch time 
    const url = `https://the-cocktail-db.p.rapidapi.com/filter.php?${formattedParam}`
    fetch(url, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
                "x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a"
            }
        })
        .then(response => {
            //return response.body
            return response.json()
        })
        .then(body => {
            document.getElementById("carousel_item_container").innerHTML = `<div class="carousel-item col-12 col-sm-6 col-md-4 col-lg-3 active">
                                      <img src="https://www.thecocktaildb.com/images/media/drink/utypqq1441554367.jpg" class="img-fluid mx-auto d-block" alt="TurfCoocktail">
                                      <p>placeholder</p>
                                      </div>`
            const data = body.drinks
            for (let i = 0; i < data.length; i++) {

                if (data[i]) { //if it exists print it
                    printCarousel(data[i])
                }
            }
            carouselEventListeners()
        })
        .catch(err => console.error(err));
}

//@carousel
//print the carousel
const printCarousel = (obj) => {
    const container = document.getElementById("carousel_item_container")
    let drinkId, drinkName, drinkCategory, drinkTags, drinkInstructionsEN, drinkImageSource;
    let drinkIngredients = []
    let drinkAmounts = []
    //lookup by id for full details
    const url = `https://the-cocktail-db.p.rapidapi.com/lookup.php?i=${obj.idDrink}`
    fetch(url, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
                "x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a"
            }
        })
        .then(response => {
            return response.json()
        })
        .then(body => {
            const data = body.drinks[0]
            drinkId = data.idDrink;
            drinkName = data.strDrink;
            drinkTags = data.strTags;
            drinkCategory = data.strCategory;
            drinkInstructionsEN = data.strInstructions;
            drinkImageSource = data.strDrinkThumb;
            for (let t = 1; t < 16; t++) {
                let ingredientPath = `data.strIngredient${t}`
                if (eval(ingredientPath)) {
                    const curIngr = eval(ingredientPath)
                    drinkIngredients[t - 1] = curIngr //add drink ingredients if they exist
                }
                const amountPath = `data.strMeasure${t}`
                const curAmt = eval(amountPath)
                if (curAmt) {
                    drinkAmounts[t - 1] = curAmt //add amount of ingredient if they exist
                }
            }
            //actually print to the carousel card
            container.innerHTML += `<div id=${drinkId} class="carousel-item col-12 col-sm-6 col-md-4 col-lg-3" onClick="makeCustomPage(${drinkId})">
                                      <img src="${drinkImageSource}" class="img-fluid mx-auto d-block" alt="${drinkName}">
                                      <p>${drinkName}</p>
                                      </div>`
            if (drinkTags) {
                const tagElt = document.createElement("p")
                tagElt.innerText = drinkTags
                document.getElementById(drinkId).appendChild(tagElt)
            }
            //printIngredients(drinkIngredients, drinkAmounts)
        })
        .catch(err => console.error(err));
}

//takes arrays of ingredients and prints them]
const printIngredients = (ingArr, amtArr) => {
    //clear out any previous list before filling with new ingredients
    document.getElementById("ingList").innerHTML = "";
    let liElts = []
    for (let i = 0; i < ingArr.length; i++) {
        liElts[i] = document.createElement("li")
        if (amtArr) {
            liElts[i].innerText = `${amtArr[i]} `
        }
        liElts[i].innerText += ingArr[i]
        document.getElementById("ingList").appendChild(liElts[i])

    }
}

//@custom Page
//creates a custom page with drink id
const makeCustomPage = (drinkId) => {
    localStorage.setItem("drinkId", `${drinkId}`)
    location.replace("./drink.html")
}

//@main
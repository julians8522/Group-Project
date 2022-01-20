/* 
    Javascript Group Project

    Authors: Brit, Julian, Michael

*/

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

//@cookies
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
    console.log(formattedParam)
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
            console.log(data)
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
window.addEventListener("load", printOptions)
const form = document.getElementById("selection_container")
form.addEventListener("submit", (evt) => {
    evt.preventDefault()
    fetchSearch(formatQuery());
    form.reset()
})
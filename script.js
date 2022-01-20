/* 
    Javascript Group Project

    Authors: Brit, Julian, Michael

*/



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
    const container = document.getElementById("selection_container")
    fetch("https://the-cocktail-db.p.rapidapi.com/list.php?i=list", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
                "x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a"
            }
        }) //grab all ingredients
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.error(err);
        });
}

const fetchSearch = () => { //grabs selected data and sends it to printCarousel
    const checkboxes = document.getElementsByClassName("checkbox")
    const numBoxes = checkboxes.length();
    let searchParams = [];
    for (let i = 0; i < numBoxes; i++) { //look at each check box, if it's checked add it to params
        let currentCheckbox = checkboxes[i];
        if (currentCheckbox.checked) {
            searchParams.push(currentCheckbox.innerText)
        }
    }
    //turn params into fetch query format
    const numParams = searchParams.length();
    let formattedParam = `i=${searchParams[0]}`
    for (let i = 0; i < numParams; i++) {
        formattedParam += `%2C${searchParams[i]}`
    }
    //check if wants alcholic drink
    const isAlcoholic = document.getElementById("alcohol_box").checked
    if (isAlcoholic) {
        formattedParam += "a=Alcoholic"
    } else {
        formattedParam += "a=Non-Alcoholic"
    }
    //check if wants cocktail or normal drink
    const isCocktail = document.getElementById("cocktail_box").checked
    const isNotCocktail = document.getElementById("without_cocktail_box").checked
    if (isCocktail && isNotCocktail) {
        //ignore for both otherwise add respective param
    } else if (isCocktail) {
        formattedParam += "c=Cocktail"
    } else if (isNotCocktail) {
        formattedParam += "c=Ordinary_Drink"
    }
    //fetch time 
    fetch(`https://the-cocktail-db.p.rapidapi.com/filter.php?${formattedParam}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
                "x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a"
            }
        })
        .then(response => {
            printCarousel(response.drinks); // call next function with data
        })
        .catch(err => {
            console.error(err);
        });
}

//print the carousel
const printCarousel = (objArr) => {
    for (let i = 0; i < objArr.length(); i++) {
        if (objArr[i]) { //if it exists print it
            let drinkId, drinkName, drinkCategory, drinkTags, drinkInstructionsEN, drinkImageSource;
            let drinkIngredients, drinkAmounts = []
            //lookup by id for full details
            fetch(`https://the-cocktail-db.p.rapidapi.com/lookup.php?i=${objArr[i].idDrink}`, {
                    "method": "GET",
                    "headers": {
                        "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
                        "x-rapidapi-key": "51e4ca45e9msh1a0ceac8a334233p1adcf3jsn2cd977ff146a"
                    }
                })
                .then(response => {
                    return response.drinks[i] //grab respective drink object
                })
                .then(data => { // destructure array
                    drinkId = data.idDrink;
                    drinkName = data.strDrink;
                    drinkTags = data.strTags;
                    drinkCategory = data.strCategory;
                    drinkInstructionsEN = data.strInstructions;
                    drinkImageSource = data.strImageSource;
                    for (let i = 0; i < 15; i++) {
                        const ingredientPath = `data.strIngredient${i}`
                        const curIngr = eval(ingredientPath)
                        if (curIngr) {
                            drinkIngredients[i] = curIngr //add drink ingredients if they exist
                        }
                        const amountPath = `data.strMeasure${i}`
                        const curAmt = eval(amountPath)
                        if (curAmt) {
                            drinkAmounts[i] = curAmt //add amount of ingredient if they exist
                        }
                    }

                })
                .catch(err => {
                    console.error(err);
                });
            //actually print to the carousel card
            //curCard.children[2].innerText = drinkInstructionsEN
            const container = document.getElementById("carousel_item_container")
            container.innerHTML = `<div class="carousel-item col-12 col-sm-6 col-md-4 col-lg-3 active">
                <img src="${drinkImageSource}" class="img-fluid mx-auto d-block" alt="${drinkName}">
             <p>${drinkInstructionsEN}</p>
             </div>`
            //printIngredients(drinkIngredients, drinkAmounts)
            //Carousel Event listener
            $('#carousel-example').on('slide.bs.carousel', function (e) {
                /*
                    CC 2.0 License Iatek LLC 2018 - Attribution required
                    obtained on 1/19/22 at https://azmind.com/bootstrap-carousel-multiple-items/
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
    }
}
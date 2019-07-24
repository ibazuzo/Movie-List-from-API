console.clear();

(function() {
    const searchInput = $("#searchInput");
    const searchForm = $("#searchForm");
    const cardList = $('<div class="cardList"></div>');
    const resultsTabs = $('<div id="resultTabs" class="results"></div>');
    const resultsTabsGroups = $('<div class="tabs-group"></div><div class="sort-group"></div>');
    const results = $('<div id="result" class="results"></div>');
    const tabs = { all: true };
    let dataArray = [];
    let dataArrayByTitle = [];
    let dataArrayByYear = [];

    searchForm.submit(function(event) {
        $("#resultsWrapper").append(resultsTabs);
        $("#resultsWrapper").append(results);

        getData(searchInput.val());
        event.preventDefault();
    });

    function clearResults() {
        cardList.empty();
        $("#resultTabs div").empty();
        $("#result").empty();
    }

    function getUrl(searchValue, pageNumber) {
        pageNumber = pageNumber || 1;
        const baseUrl = "https://www.omdbapi.com/?apikey=6ba62b70";
        const urlWithParameter = `${baseUrl}&s=${searchValue}&page=${pageNumber}`;
        return urlWithParameter;
    }

    function request(searchValue, pageNumber) {
        return $.get(getUrl(searchValue, pageNumber), function(data) {
            return data;
        });
    }

    function getData(searchValue) {
        dataArray.length = 0;
        $.get(getUrl(searchValue), function(data) {
            if (data.Error == "Movie not found!") {
                $("#result").html('<div class="empty-search-message">We couldn\'t found the terms you searched for. Try again.</div>');
            } else {
                const numberOfCalls = parseInt(data.totalResults / 10) + 1;
                const reqArray = [];
                dataArray = dataArray.concat(data.Search);

                for (let pageNumber = 2; pageNumber <= numberOfCalls; pageNumber++) {
                    reqArray.push(request(searchValue, pageNumber));
                }

                $.when(reqArray).done(function(responses) {
                    prepareData(responses, dataArray);
                });
            }
        });
    }

    function prepareData(responses, dataArray) {
        Promise.all(responses).then(function(values) {
            values.map(item => item.Search).forEach(item => {
                dataArray = dataArray.concat(item);
            });

            dataArrayByTitle = sortBy("Title", dataArray);
            dataArrayByYear = sortBy("Year", dataArray);

            buildResultsSection(dataArray);
        });
    }

    function createTab(tabName) {
        const tab = $(`<button class="tab-button">${tabName}</button>`);

        // if (tabName === "all") {
        //     tab.addClass("active");
        // }

        tab.click(function(event) {
            $(".tab-button").removeClass("active");
            event.target.classList.add("active");
            $(".card").each(function() {
                const el = $(this);
                if (tabName === "all") {
                    el.show();
                } else if (el.data().type !== tabName) {
                    el.hide();
                } else {
                    el.show();
                }
            });
        });

        return tab;
    }

    function addToDom() {
        $("#result").append(cardList);
    }

    function sortBy(key, arr) {
        return [...arr].sort(function(a, b) {
            var aName = a[key].toLowerCase();
            var bName = b[key].toLowerCase();
            return aName < bName ? -1 : aName > bName ? 1 : 0;
        });
    }

    function createSortButton(buttonName, arr, sortAsc) {
        const button = $(`<button class="` + (sortAsc == true ? "sortAsc" : "sortDesc") + `">${buttonName}</button>`);

        button.click(function() {
            const activeTab = $('button.tab-button.active').text();
            if (activeTab !== "all") {
                let arrFiltered = arr.filter(function(el) {
                    return el.Type == activeTab;
                });

                console.log('arr=' + arr);
                console.log('result=' + arrFiltered);
                buildResultsSection(sortAsc == true ? arrFiltered : [...arrFiltered].reverse());
            } else {
                buildResultsSection(sortAsc == true ? arr : [...arr].reverse());

            }
        });

        return button;
    }

    function buildResultsSection(data) {
        clearResults();
        $("#resultTabs").append(resultsTabsGroups);

        buildList(data);
        Object.keys(tabs).forEach(function(el) {
            $("#resultTabs .tabs-group").append(createTab(el));
        });
        $('#resultTabs .sort-group').append("<span>Sort by Title: </span>")
            .append(
                createSortButton('<i class="fas fa-sort-alpha-up"></i>', dataArrayByTitle, true)
            )
            .append(
                createSortButton('<i class="fas fa-sort-alpha-down-alt"></i>', dataArrayByTitle, false)
            )
            .append("<span>by Year: </span>")
            .append(
                createSortButton('<i class="fas fa-sort-numeric-up"></i>', dataArrayByYear, true)
            ).append(
                createSortButton('<i class="fas fa-sort-numeric-down-alt"></i>', dataArrayByYear, false)
            );

        addToDom();
    }

    function buildList(data) {
        data.forEach(function(obj) {
            tabs[obj.Type] = true;
            cardList.append(buildCard(obj));
        });
    }

    function buildCard(info) {
        const card = $(`<div class="card" data-type="${info.Type}"></div>`);
        const imgUrl =
            info.Poster == "N/A" ?
            "https://via.placeholder.com/125x180" :
            info.Poster.replace("http:", "https:"); // we make sure the url is with https to reduce errors
        const poster = $('<div class="poster"></div>').append(
            `<img src="${imgUrl}" alt="${info.Title}">`
        );

        const details = $('<div class="details"></div>').append(
            `<h3 class="title">${info.Title}</h3>`
        );

        const subtitle = $('<div class="subtitle"></div>')
            .append(`<span class="type">${info.Type}</span>`)
            .append(`<span class="year">(${info.Year})</span>`);

        const imdbUrl = `https://www.imdb.com/title/${info.imdbID}/`;

        details
            .append(subtitle)
            .append(
                `<div class="description">IMDB Link: <a href="${imdbUrl}">${imdbUrl}</a></div>`
            );

        card.append(poster).append(details);

        return card;
    }
})();
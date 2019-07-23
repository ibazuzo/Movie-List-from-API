console.clear();

(function() {
    const searchInput = $("#searchInput");
    const searchForm = $("#searchForm");
    const cardList = $('<div class="cardList"></div>');
    const resultsTabs = $('<div id="resultTabs" class="results"></div>');
    const results = $('<div id="result" class="results"></div>');
    const tabs = { all: true };

    searchForm.submit(function(event) {

        clearResults();

        $('#resultsWrapper').append(resultsTabs);
        $('#resultsWrapper').append(results);

        getData(searchInput.val());
        event.preventDefault();
    });

    function clearResults() {
        cardList.empty();
        $('#resultTabs').empty();
        $('#result').empty();
    }

    function getData(searchValue) {
        const baseUrl = "https://www.omdbapi.com/?apikey=6ba62b70";
        const urlWithParameter = `${baseUrl}&s=${searchValue}&page=1`;
        $.get(urlWithParameter, function(data) {
            buildList(data);
        });
    }

    function buildList(data) {
        data.Search.forEach(function(obj) {
            tabs[obj.Type] = true;
            cardList.append(buildCard(obj));
        });
        Object.keys(tabs).forEach(function(el) {
            $('#resultTabs').append(createTab(el));
        });
        addToDom();
        console.log(tabs);
    }

    function createTab(tabName) {

        const tab = $(`<button>${tabName}</button>`);

        tab.click(function() {
            $('.card').each(function() {
                const el = $(this);
                if (tabName === 'all') {
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

        $('#result').append(cardList);
    }

    function buildCard(info) {

        const card = $(`<div class="card" data-type="${info.Type}"></div>`);
        const poster = $('<div class="poster"></div>')
            .append(`<img src="${info.Poster}" alt="${info.Title}">`);

        const details = $('<div class="details"></div>')
            .append(`<h3 class="title">${info.Title}</h3>`);

        const subtitle = $('<div class="subtitle"></div>')
            .append(`<span class="type">${info.Type}</span>`)
            .append(`<span class="year">(${info.Year})</span>`);

        const imdbUrl = `https://www.imdb.com/title/${info.imdbID}/`;

        details
            .append(subtitle)
            .append(`<div class="description">IMDB Link: <a href="${imdbUrl}">${imdbUrl}</a></div>`);

        card
            .append(poster)
            .append(details);

        return card;
    }
})();
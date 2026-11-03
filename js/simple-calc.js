// Simple Income Gap Calculator, used on calculator.html only. Wrapped in a
// function so its names can't collide with the globals in js/script.js, which
// must load first (cyopTrackCalcStarted, cyopTrackGapCalculated). Sends no
// session ID, so rows from this page can't be matched to contact details.
(function () {
  var expenseIds = ["sc-housing", "sc-healthcare", "sc-groceries", "sc-transportation", "sc-other"];
  var incomeIds = ["sc-social-security", "sc-pension"];
  var results = document.getElementById("sc-results");
  var gapResult = document.getElementById("sc-result-gap");
  var coveredResult = document.getElementById("sc-result-covered");
  var lastSubmitted = "";

  // Accepts "1200", "1,200", "$1,200.50". Blank, text and negatives count as 0.
  function parseAmount(text) {
    var amount = parseFloat(text.replace(/[$,\s]/g, ""));
    return amount > 0 ? amount : 0;
  }

  function formatMoney(amount) {
    return "$" + Math.round(amount).toLocaleString("en-US");
  }

  function sumFields(ids) {
    return ids.reduce(function (total, id) {
      return total + parseAmount(document.getElementById(id).value);
    }, 0);
  }

  function updateTotals() {
    document.getElementById("sc-expenses-total").textContent = formatMoney(sumFields(expenseIds));
    document.getElementById("sc-income-total").textContent = formatMoney(sumFields(incomeIds));
  }

  function handleInput() {
    cyopTrackCalcStarted();
    updateTotals();
    results.hidden = true;
  }

  // Posts to the "Income Gap Inputs" Google Form through the hidden iframe.
  // Monthly Gap keeps the sheet's sign: income minus expenses, negative for a gap.
  // Skipped when the amounts match this page's last submission.
  function submitData(expenses, income) {
    var groceries = parseAmount(document.getElementById("sc-groceries").value);
    var amounts = [expenses, income, groceries].join("|");
    if (amounts === lastSubmitted) return;
    lastSubmitted = amounts;

    document.getElementById("sc-f-gap").value = Math.round(income - expenses);
    document.getElementById("sc-f-totalexpenses").value = Math.round(expenses);
    document.getElementById("sc-f-totalincome").value = Math.round(income);
    document.getElementById("sc-f-groceries").value = groceries;
    document.getElementById("sc-f-version").value = "Simple";
    document.getElementById("sc-data-form").submit();
  }

  function showResults() {
    var expenses = sumFields(expenseIds);
    var income = sumFields(incomeIds);

    // Nothing entered: no result to show, nothing to record.
    if (expenses === 0 && income === 0) {
      document.getElementById(expenseIds[0]).focus();
      return;
    }

    var gap = Math.round(expenses - income);
    gapResult.hidden = gap <= 0;
    coveredResult.hidden = gap > 0;
    if (gap > 0) {
      document.getElementById("sc-gap-amount").textContent = formatMoney(gap);
      document.getElementById("sc-gap-annual").textContent = formatMoney(gap * 12);
    }
    results.hidden = false;
    results.focus();

    cyopTrackGapCalculated();
    submitData(expenses, income);
  }

  expenseIds.concat(incomeIds).forEach(function (id) {
    document.getElementById(id).addEventListener("input", handleInput);
  });
  document.getElementById("sc-show-gap").addEventListener("click", showResults);
})();

// Custom function

function customCalculateMatch(pageIndex) {
    let pageContent = this._pageContents[pageIndex];
    let query = this._query;
    const { caseSensitive, entireWord, phraseSearch, regexStr } = this._state;
    if (query.length === 0) {
      return;
    }
    if (!caseSensitive) {
      pageContent = pageContent.toLowerCase();
      query = query.toLowerCase();
    }
    if (phraseSearch) {
      this._calculatePhraseMatch(query, pageIndex, pageContent, entireWord, regexStr);
    } else {
      this._calculateWordMatch(query, pageIndex, pageContent, entireWord);
    }
    if (this._state.highlightAll) {
      this._updatePage(pageIndex);
    }
    if (this._resumePageIdx === pageIndex) {
      this._resumePageIdx = null;
      this._nextPageMatch();
    }
    const pageMatchesCount = this._pageMatches[pageIndex].length;
    if (pageMatchesCount > 0) {
      this._matchesCountTotal += pageMatchesCount;
      this._updateUIResultsCount();
    }
  }

function customCalculatePhraseMatch(query, pageIndex, pageContent, entireWord, regexStr) {
    const matches = [];
    const queryLen = query.length;

	const re = new RegExp(regexStr, 'g')

	while ((match = re.exec(pageContent)) != null) {

		matches.push(match.index);
	}
    this._pageMatches[pageIndex] = matches;
}


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep(fn, ...args) {
    await timeout(2000);
    return fn(...args);
}


async function colorMe (color) {
	/*
	we use the parentNode because sp exist only during the current search
	 */
	for (let sp of document.getElementsByClassName("highlight")) {
		sp.parentNode.style.backgroundColor  = color
		sp.parentNode.classList.remove("highlight")
	}
}

async function start() {
	/*
	queryLen = length of the text which will be highlighted at first
	regexStr = the regex you want to use for your research
	color = color your want as background for the results
	 */
	const researches = [
		{queryLen: 20, regexStr: "repeated", color: "random.*control"},
		{queryLen: 20, regexStr: "experimental", color: "red"},
		{queryLen: 20, regexStr: "istress ", color: "blue"},
	]
	for await (const research of researches) {
		PDFViewerApplication.pdfViewer.findController.executeCommand(
			"find",
			{
				query: "x".repeat(research.queryLen), phraseSearch: true,
				highlightAll: true, regexStr: research.regexStr
			})
		await sleep(colorMe, research.color)
	}
}

/*
We override the functions planned for the search with our custom functions which will use some regex.
Ideally, we would not want to modify them and define our own functions and structure but...!
 */
const oriCalculatePhraseMatch = PDFViewerApplication.pdfViewer.findController._calculatePhraseMatch;
const oriCalculateMatch = PDFViewerApplication.pdfViewer.findController._calculateMatch
PDFViewerApplication.pdfViewer.findController._calculatePhraseMatch = customCalculatePhraseMatch;
PDFViewerApplication.pdfViewer.findController._calculateMatch = customCalculateMatch

await start()

// back to normal
PDFViewerApplication.pdfViewer.findController._calculateMatch = oriCalculateMatch
PDFViewerApplication.pdfViewer.findController._calculatePhraseMatch = oriCalculatePhraseMatch;

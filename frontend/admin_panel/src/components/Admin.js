import React, {Component} from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button } from "react-bootstrap";
import BlogModal from './Modal';

export default class Admin extends Component {

    constructor(props) {
        super(props);

        this.state = {
            search_results: ["Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending..."],
            search_history: [],
            tag: null,
            search: "",
            show: 'show',
            timer: null,
            isModalOpen: false,
            currentBlog: null, // can hold an index from search_results array which will be visible in Modal
            currentTitle: null,
            currentAuthor: null,
            currentRead: null,
            currentUrl: null,
            currentTag: null,
            currentTimeTaken: null,
            currentComment: null,
            isSearchHistoryOpen: false
        }
    }

    componentDidMount() {
        this.divstatus()
        this.fetchSearchResults()
    }

    divstatus = (e) =>{
        // this.setState({show: (this.state.show === 'show') ? 'hide' : 'show'});

        if(this.state.search !== "") {
            this.setState({show: 'show'});
        }
        else {
            this.setState({show: 'hide'});
        }
    }

    fetchSearchResults() {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Accept", "application/json");

        var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
        };

        fetch("http://127.0.0.1:5000/get-search-results", requestOptions)
        .then(response => response.text())
        .then(result => {
            result = JSON.parse(result);
            result.data.map((element, index) => {
                this.setState({ search_history: [...this.state.search_history, element] })
            })
        })
        .catch(error => console.log('error', error));
    }

    onlyFetchResults() {
        // check if search result length is 10 and stop interval
        const timer = this.state.timer;
        const search_results = [...this.state.search_results];
        if(search_results.length >= 10 && search_results[9] !== "Pending...") {
            console.log("--- Timer cleared ---")
            clearInterval(timer);
            this.setState({ timer: null });
        }
        else {
            this.divstatus();
            // call server to fetch results from db
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
            };

            fetch("http://127.0.0.1:5000/get-blogs", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log("Results are here:");
                // console.log(typeof(result));
                const res = JSON.parse(result);
                // console.log(res);
                res.data.map((element, index) => {
                    // console.log(element);
                    // let id = element[0];
                    // let title = element[1];
                    // let author = element[2];
                    // let read = element[3];
                    // let tag = element[4];
                    // let comments = element[5];
                    // let publish_time = element[6];
                    // let link = element[7];
                    // let time_taken = element[8];
                    // let obj = id + "," + title + "," + author + "," + read + "," + tag + "," + comments + "," + publish_time + "," + link + "," + time_taken;
                    // let search_results = [...this.state.search_results]
                    // this.setState({ search_results: [...search_results, obj] });
                    this.state.search_results[index] = element; 
                    if(index < 8) {
                        this.state.search_results[index + 1] = "Crawling...";
                    }
                    console.log("--- State ---");
                    this.divstatus();
                    console.log(this.state);
                })
            })
            .catch(error => console.log('error', error));
        }
    }

    searchTag() {
        // query the backend with tag
        let query = this.state.search
        query = query.trim().toLowerCase()
        if(!query) {
            alert("Please enter a tag!");
        }
        else {
            console.log("You searched for: "+ query);
            this.setState({ search_results: ["Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending..."] })

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag: query })
            };
            // TODO: uncomment to actually search
            fetch('http://127.0.0.1:5000/search', requestOptions)
                .then(response => response.json())
                .then(data => console.log(data));
    
            // set event to call fetch result every 10 secs
            const timer = setInterval(() => {
                console.log('Polling server for results');
                this.onlyFetchResults()
            }, 1000);

            this.setState({ timer: timer, tag: query });
            console.log("Current state");
            console.log(this.state);
        }
    }   

    handleEvent = event => {
        this.setState({ search: event.target.value });
    }

    showDetails(index) {
        const blog = this.state.search_results[index];
        console.log(blog);
        this.setState({ 
            currentTitle: blog[1],
            currentAuthor: blog[2],
            currentRead: blog[3],
            currentTag: blog[4],
            currentBlog: blog[5],
            currentComment: "Not available",
            currentUrl: blog[8],
            currentTimeTaken: blog[9], 
            isModalOpen: true,
        });
    }

    hideModal = () => {
        this.setState({isModalOpen: false});
    }
    
    hideSearchModal = () => {
        this.setState({isSearchHistoryOpen: false});
    }

    showSearchHistory() {
        this.setState({isSearchHistoryOpen: true});
    }


    render() {

        return (
            <>
            <div className="main">
            <span id="title">Medium Crawler</span>
            <form className="main-search" onSubmit={(e) => {e.preventDefault(); this.searchTag()}}>
                {/* <div className="inp"> */}
                    <input onChange={this.handleEvent} className="inp" type="text" autoComplete="off" placeholder="Input a tag to search medium" name="search" id="search" />
                {/* </div> */}
                <button type="submit" className="btn btn-outline-success">
                    <i className="fa fa-search"></i>
                </button>
            </form>
            <h2 className="text-center mt-5 search-results" hidden={this.state.tag ? false : true}>Results will appear below</h2>
            {/* <span id="desc">Or Search using popular tags</span>
            <div>
                <span>
                    <button type="button" className="btn btn-outline-success">Coding</button>
                </span>
            </div> */}
            </div>
            <div className="count" onClick={() => {this.showSearchHistory()}}>
                <span className="search-history-count">
                    <i className="fa fa-history" id="history-icon"></i>
                    {this.state.search_history.length}
                </span>
            </div>
            <div id={this.state.show} className="content">
                <ol className="blogs">
                    {
                        this.state.search_results.map((result, index) => (
                            <li key={index} className="blog" onClick={() => this.showDetails(index)}>
                                {( (result[1] === "e" || result[1] === "r") ? result : result[1])}
                            </li>
                        ))
                    }
                </ol>
            </div>
            {/* blog modal */}
            <Modal show={this.state.isModalOpen} onHide={this.hideModal} dialogClassName="modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>Blog details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        <>
                            <span>
                                <h5 className="current-title">Title: {this.state.currentTitle}</h5>
                                <h6 className="current-author">Author: {this.state.currentAuthor}</h6>
                                <p className="read-time">{this.state.currentRead}</p>
                            </span>
                            <p className="current-blog">
                                {this.state.currentBlog}
                            </p>
                            <p className="source-url">Source url: <a href={this.state.currentUrl} target="_blank" rel="noreferrer">Medium</a></p>
                            <p>
                                Tags: <span className="tags">{this.state.currentTag}</span>
                            </p>
                            <p className="float-left scraping-time">Time taken to scrape: {this.state.currentTimeTaken} secs</p>
                        </>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.hideModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* search history modal */}
            <Modal show={this.state.isSearchHistoryOpen} onHide={this.hideSearchModal} dialogClassName="modal-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>Search history</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        this.state.search_history.map((result, index) => (
                            <ul key={result[0]}>
                                <li>
                                    <span className="search-history">{result[1].toUpperCase()}</span> searched at {result[2]}
                                </li>
                            </ul>
                        ))
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.hideSearchModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            </>
        );
    }
}
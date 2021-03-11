import React, {Component} from 'react';
import { render } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class Admin extends Component {

    constructor(props) {
        super(props);

        this.state = {
            search_results: ["Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending...","Pending..."],
            tag: null,
            search: "",
            show: 'show',
            timer: null,
        }
    }

    componentDidMount() {
        this.divstatus()
    }

    divstatus = (e) =>{
        // this.setState({show: (this.state.show === 'show') ? 'hide' : 'show'});

        if(this.state.search_results.length) {
            this.setState({show: 'show'});
        }
        else {
            this.setState({show: 'hide'});
        }
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
                    let id = element[0];
                    let title = element[1];
                    let author = element[2];
                    let read = element[3];
                    let tag = element[4];
                    let comments = element[5];
                    let publish_time = element[6];
                    let link = element[7];
                    let time_taken = element[8];
                    let obj = id + "," + title + "," + author + "," + read + "," + tag + "," + comments + "," + publish_time + "," + link + "," + time_taken;
                    // let search_results = [...this.state.search_results]
                    // this.setState({ search_results: [...search_results, obj] });
                    this.state.search_results[index] = obj;
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
        console.log("You searched for: "+ query);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var formdata = new FormData();
        formdata.append("tag", query);

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
        };

        // fetch("http://127.0.0.1:5000/search", requestOptions)
        // .then(response => response.text())
        // .then(result => console.log(result))
        // .catch(error => console.log('error', error));

        // set event to call fetch result every 10 secs
        const timer = setInterval(() => {
            console.log('Polling server for results');
            this.onlyFetchResults()
        }, 10000);

        this.setState({ timer: timer, tag: query });
        console.log("Current state");
        console.log(this.state);
    }   

    handleEvent = event => {
        this.setState({ search: event.target.value });
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
                <button type="submit" className="btn btn-success">
                    <i className="fa fa-search"></i>
                </button>
            </form>
            <h2 className="text-center mt-5 search-results" hidden={this.state.tag ? false : true}>Search results</h2>
            {/* <span id="desc">Or Search using popular tags</span>
            <div>
                <span>
                    <button type="button" className="btn btn-outline-success">Coding</button>
                </span>
            </div> */}
            </div>
            <div className="count">
                <span>
                    <i className="fa fa-history" id="history-icon"> 0</i>
                </span>
            </div>
            <div id={this.state.show} className="content">
                <ol className="blogs">
                    {
                        this.state.search_results.map((result, index) => (
                            <li>
                                {result}
                            </li>
                        ))
                    }
                </ol>
            </div>
            </>
        );
    }
}
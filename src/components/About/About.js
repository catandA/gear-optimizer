import React, {Component} from 'react';
import ReactGA from 'react-ga';
import './About.css';
import Modal from 'react-modal';

import GitCommit from '../../_git_commit';
import GOVersion from '../../_version';
import {default as PortForm} from '../PortForm/PortForm'
import DarkModeContext from '../AppLayout/DarkModeContext';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

class AboutComponent extends Component {
    static contextType = DarkModeContext;

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            latest: null
        };
        this.fresh = true;
    }

    getLatestVersionNumber() {
        // create a new XMLHttpRequest
        var xhr = new XMLHttpRequest()
        // get a callback when the server responds
        xhr.addEventListener('load', () => {
            // update the state of the component with the result
            let result = null;
            try {
                result = JSON.parse(xhr.responseText)[0].name;
            } catch (e) {
                result = null;
            }
            if (result !== null) {
                this.setState({latest: result})
            }
        })
        // open the request with the verb and the url
        xhr.open('GET', 'https://api.github.com/repos/gmiclotte/gear-optimizer/tags')
        // send the request
        xhr.send()
    }

    render() {
        ReactGA.pageview('/about');
        if (this.fresh) {
            try {
                this.getLatestVersionNumber();
            } catch (e) {
                this.setState({latest: null});
            }
            this.fresh = false;
        }
        return <div>
            <p className="center">
                {'NGU Idle 装备优化器 v' + GOVersion.version}
                <br/> {
                '最新版本：' + (
                    this.state.latest === null
                        ? '加载中...'
                        : ('v' + this.state.latest))
            }
                <br/> {
                this.state.latest !== null && GOVersion.version !== this.state.latest
                    ? '请关闭并重新打开优化器一到两次以更新。'
                    : ''
            }
                <br/> {'Git 哈希：' + GitCommit.logMessage.slice(0, 8)}
                <br/>
                <a href="https://github.com/gmiclotte/gear-optimizer/issues/new" rel="noopener noreferrer"
                   target="_blank">
                    报告问题。
                </a>
                <br/>
                <br/> {'与 '}
                <a href="https://www.kongregate.com/games/somethingggg/ngu-idle" rel="noopener noreferrer"
                   target="_blank">
                    NGU Idle
                </a>{' 无关。'}
                <br/>
                <br/> {'所有艺术版权归 '}
                <a href="https://www.kongregate.com/accounts/somethingggg" rel="noopener noreferrer" target="_blank">
                    4G
                </a>{' 所有。'}
                <br/>
                <br/>
                <button onClick={() => this.setState({open: true})}>{'导入/导出本地存储'}</button>
            </p>
            <Modal className={'port-modal' + (this.context ? ' dark-mode' : '')} overlayClassName='port-overlay'
                   isOpen={this.state.open}
                   onAfterOpen={undefined} onRequestClose={() => (this.setState({open: false}))} style={customStyles}
                   contentLabel='导入/导出' autoFocus={false}>
                <PortForm {...this.props} closePortModal={() => (this.setState({open: false}))}/>
            </Modal>
        </div>
    };
}

export default AboutComponent;

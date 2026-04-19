import React, {Component} from 'react';
import ReactGA from 'react-ga';
import {Wish} from '../../Wish';
import {Wishes} from '../../assets/ItemAux';
import ResourcePriorityForm from '../ResourcePriorityForm/ResourcePriorityForm';
import WishForm from '../WishForm/WishForm';
import {default as Crement} from '../Crement/Crement';
import {shortenExponential, toTime} from '../../util';
import ModifierForm from '../ModifierForm/ModifierForm';

class WishComponent extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleFocus(event) {
        event.target.select();
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    handleChange(event, name, idx = -1) {
        let val = event.target.value;
        let wishstats = {
            ...this.props.wishstats
        };
        if (idx < 0) {
            wishstats = {
                ...wishstats,
                [name]: val
            };
            this.props.handleSettings('wishstats', wishstats);
            return;
        }
        let wishes = [...wishstats.wishes];
        const increasedStart = name === 'start' && Number(val) > wishes[idx].start;
        let wish = {
            ...wishes[idx],
            [name]: val
        };
        wish.goal = this.goallevel(wish, increasedStart);
        wish.start = this.startlevel(wish);
        wishes[idx] = wish;
        wishstats = {
            ...wishstats,
            wishes: wishes
        };
        this.props.handleSettings('wishstats', wishstats);

    }

    goallevel(data, increasedStart) {
        data.goal = Number(data.goal)
        if (increasedStart) {
            data.start = Number(data.start)
            if (data.start >= data.goal) {
                data.goal = data.start + 1;
            }
        }
        if (data.goal < 1) {
            return 0;
        }
        if (data.goal > Wishes[data.wishidx][2]) {
            return Wishes[data.wishidx][2];
        }
        return data.goal;
    }

    startlevel(data) {
        data.start = Number(data.start)
        if (data.start < 0 || data.goal === 0) {
            return 0;
        }
        if (data.start >= data.goal) {
            return data.goal - 1;
        }
        return data.start;
    }

    wishtime(data) {
        if (data.wishtime < (data.goal - data.start) * data.wishcap) {
            return (data.goal - data.start) * data.wishcap;
        }
        return data.wishtime;
    }

    copyToClipboard(e) {
        e.target.select();
        document.execCommand('copy');
    };

    render() {
        ReactGA.pageview('/wishes/');
        let wish = new Wish(this.props);
        const results = wish.optimize();
        const score = toTime(Math.max(...results[0]));
        const scores = results[0];
        const assignments = results[1];
        const remaining = results[2];
        const trueScores = results[3];
        return (<div className='center'>
            <form onSubmit={this.handleSubmit}>
                <div>
                    {
                        [['eE', '能量'], ['mM', '魔力'], ['rR', '资源3']].map(x => <div key={x[0]}>
                            <label>
                                {x[1] + '强度'}
                                <input style={{
                                    width: '11ch',
                                    margin: '1ch'
                                }} type="number" step="any" value={this.props.wishstats[x[0][0] + 'pow']}
                                       onFocus={this.handleFocus} onChange={(e) => this.handleChange(e, x[0][0] + 'pow')}/>
                            </label>
                            <label>
                                {' 上限'}
                                <input style={{
                                    width: '11ch',
                                    margin: '1ch'
                                }} type="number" step="any" value={this.props.wishstats[x[0][0] + 'cap']}
                                       onFocus={this.handleFocus} onChange={(e) => this.handleChange(e, x[0][0] + 'cap')}/>
                            </label>
                            <label>
                                {' 使用 (%)'}
                                <input style={{
                                    width: '11ch',
                                    margin: '1ch'
                                }} type="number" step="any" value={this.props.wishstats[x[0][0] + 'pct']}
                                       onFocus={this.handleFocus} onChange={(e) => this.handleChange(e, x[0][0] + 'pct')}/>
                            </label>
                        </div>)
                    }
                </div>
                <label>
                    {'许愿速度修正:'}
                    <input style={{
                        width: '6.6ch',
                        margin: '1ch'
                    }} type="number" step="any" value={this.props.wishstats.wishspeed} onFocus={this.handleFocus}
                           onChange={(e) => this.handleChange(e, 'wishspeed')}/>
                </label>
                <br/>
                <ModifierForm {...this.props} name={'wishstats'} e={true} m={true} r={true}/>
                <label>
                    {'最小许愿时间:'}
                    <input style={{
                        width: '6.6ch',
                        margin: '1ch'
                    }} type="number" step="any" value={this.props.wishstats.wishcap} onFocus={this.handleFocus}
                           onChange={(e) => this.handleChange(e, 'wishcap')}/> {' 分钟'}
                </label>
                <br/>
                <div>{'均衡资源'}
                    <label>
                        <input type="checkbox" checked={this.props.wishstats.equalResources}
                               onChange={(e) => this.props.handleSettings('wishstats', {
                                   ...this.props.wishstats,
                                   equalResources: !this.props.wishstats.equalResources
                               })}/>
                    </label>
                </div>
                {<ResourcePriorityForm {...this.props} handleChange={this.handleChange}/>}
                <div><Crement header='许愿槽位' value={this.props.wishstats.wishes.length} name='wishslots'
                              handleClick={this.props.handleCrement} min={1} max={100}/></div>
                <br/> {
                this.props.wishstats.wishes.map((wish, pos) => <div key={pos}>
                    {
                        [Wishes.keys()].map(idx => (<div style={{
                            display: 'inline'
                        }} key={'wishform' + pos}><WishForm {...this.props} handleChange={this.handleChange}
                                                            wishidx={wish.wishidx} idx={pos}/></div>))
                    }
                    <br/>
                    <label>
                        {' 起始等级:'}<input style={{
                        width: '4.4ch',
                        margin: '1ch'
                    }} type="number" step="any" value={this.props.wishstats.wishes[pos].start}
                                                onFocus={this.handleFocus}
                                                onChange={(e) => this.handleChange(e, 'start', pos)}/>
                    </label>
                    <label>
                        {' 目标等级:'}<input style={{
                        width: '4.4ch',
                        margin: '1ch'
                    }} type="number" step="any" value={this.props.wishstats.wishes[pos].goal} onFocus={this.handleFocus}
                                                 onChange={(e) => this.handleChange(e, 'goal', pos)}/>
                    </label>
                </div>)
            }</form>
            <br/>
            <table style={{
                display: 'inline-block'
            }}>
                <tbody>{
                    assignments.map((a, idx) => <tr key={idx}>
                        <td>{'许愿 ' + this.props.wishstats.wishes[idx].wishidx + ' 需要: '}</td>
                        {
                            a.map((val, jdx) => <td key={jdx} style={{
                                display: 'inline-block'
                            }}>
                                <input style={{
                                    resize: 'none',
                                    width: '9ch'
                                }} onFocus={this.copyToClipboard} readOnly={true} key={jdx + 'text'}
                                       value={shortenExponential(val)}/>
                                <div key={jdx + 'div'} style={{
                                    paddingRight: '1ch',
                                    display: 'inline-block'
                                }}>{['能量', '魔力', '资源3'][jdx]}</div>
                            </td>)
                        }
                        <td>{toTime(scores[idx])}</td>
                    </tr>)
                }</tbody>
            </table>
            <br/> {score + '后所有目标都将达成'}
            <br/>
            <br/> {'剩余资源: '}
            {
                remaining.map((val, jdx) => <div key={jdx} style={{
                    display: 'inline-block'
                }}>
                    <input style={{
                        resize: 'none',
                        width: '9ch'
                    }} onFocus={this.copyToClipboard} readOnly={true} key={jdx + 'text'}
                           value={shortenExponential(val)}/>
                    <div key={jdx + 'div'} style={{
                        paddingRight: '1ch',
                        display: 'inline-block'
                    }}>{['能量', '魔力', '资源3'][jdx]}</div>
                </div>)
            }
            <br/>
            <br/>
            <div>{'许愿时间估算'}
                <label>
                    <input type="checkbox" checked={this.props.wishstats.trueTime}
                           onChange={(e) => this.props.handleSettings('wishstats', {
                               ...this.props.wishstats,
                               trueTime: !this.props.wishstats.trueTime
                           })}/>
                </label>
            </div>
            {
                this.props.wishstats.trueTime
                    ? <table style={{
                        display: 'inline-block'
                    }}>
                        <tbody>
                        <tr>
                            <th>{'许愿'}</th>
                            <th>{'理论值'}</th>
                            <th>{'实际值'}</th>
                            <th>{'停止于'}</th>
                        </tr>
                        {
                            this.props.wishstats.wishes.map((wish, pos) => <tr key={pos}>
                                <td>{wish.wishidx + ' (' + wish.start + ' → ' + wish.goal + ')'}</td>
                                <td>{toTime(scores[pos])}</td>
                                <td>{toTime(trueScores[pos][1])}</td>
                                <td>{"等级 " + trueScores[pos][2]}</td>
                            </tr>)
                        }</tbody>
                    </table>
                    : <div/>
            }
        </div>)
    };
}

export default WishComponent;

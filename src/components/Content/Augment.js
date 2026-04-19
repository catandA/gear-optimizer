import React, {Component} from 'react';
import ReactGA from 'react-ga';
import {Augment} from '../../Augment';
import {shortenExponential} from '../../util';
import VersionForm from '../VersionForm/VersionForm'

const AUGS = [
    {
        name: '剪刀',
        boost: Math.pow(25, 0)
    }, {
        name: '牛奶',
        boost: Math.pow(25, 1)
    }, {
        name: '加农炮',
        boost: Math.pow(25, 2)
    }, {
        name: '加特林',
        boost: Math.pow(25, 3)
    }, {
        name: '能量飞弹',
        boost: Math.pow(25, 4)
    }, {
        name: '外骨骼',
        boost: Math.pow(25, 5) * 1e2
    }, {
        name: '激光剑',
        boost: Math.pow(25, 6) * 1e4
    }
]

class AugmentComponent extends Component {
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
        let augstats = {
            ...this.props.augstats
        };
        if (idx < 0) {
            augstats = {
                ...augstats,
                [name]: val
            };
            this.props.handleSettings('augstats', augstats);
            return;
        }
        let augs = [...augstats.augs];
        let aug = {
            ...augs[idx],
            [name]: val
        };
        augs[idx] = aug;
        augstats = {
            ...augstats,
            augs: augs
        };
        this.props.handleSettings('augstats', augstats);


    }

    configureRatios(key) {
        const augstats = this.props.augstats;
        let augs;
        let augmentOptimizer = new Augment(augstats, AUGS);
        const version = augstats.version;
        if (key === 'exponent') {
            augs = augstats.augs.map((aug, idx) => {
                const ratio = augmentOptimizer.exponent(idx) / 2;
                return {
                    ...aug,
                    ratio: ratio
                };
            });
        }
        if (key === 'cost') {
            augs = augstats.augs.map((aug, idx) => {
                const ratio = augmentOptimizer.cost(idx, version, false, false) / augmentOptimizer.cost(idx, version, true, false);
                return {
                    ...aug,
                    ratio: ratio
                };
            });
        }
        if (key === 'equal') {
            augs = augstats.augs.map((aug, idx) => {
                return {
                    ...aug,
                    ratio: 1
                };
            });
        }
        this.props.handleSettings('augstats', {
            ...augstats,
            augs: augs
        });

    }

    input(val, args, width = 100) {
        return <label>
            <input style={{
                width: width + 'px',
                margin: '5px'
            }} type="number" step="any" value={val} onFocus={this.handleFocus}
                   onChange={(e) => this.handleChange(e, ...args)}/>
        </label>;
    }

    namedInput(name, val, args, width = 100) {
        return <tr>
            <td>{name}</td>
            <td>
                {this.input(val, args, width)}
            </td>
        </tr>;
    }

    augment(augstats, aug, pos) {
        let augmentOptimizer = new Augment(augstats, AUGS);
        const augresult = augmentOptimizer.reachable(pos, false);
        const auglevel = augresult[0];
        const goldlimited = augresult[1];
        const upglevel = goldlimited
            ? 0
            : augmentOptimizer.reachable(pos, true)[0];
        const boost = augmentOptimizer.boost(pos, auglevel, upglevel);
        const energy = augmentOptimizer.energy(pos);
        return <tr key={pos}>
            <td>{aug.name}</td>
            <td>{
                this.input(augstats.augs[pos].ratio, [
                    'ratio', pos
                ], 50)
            }</td>
            <td>{shortenExponential(energy[0])}</td>
            <td>{shortenExponential(energy[1])}</td>
            <td>{shortenExponential(auglevel)}</td>
            <td>{shortenExponential(upglevel)}</td>
            <td>{shortenExponential(boost)}</td>
        </tr>
    }

    render() {
        ReactGA.pageview('/augment/');
        const augstats = this.props.augstats;
        return (<div className='center'>
            <form onSubmit={this.handleSubmit}>
                <table className='center'>
                    <tbody>
                    {this.namedInput('能量上限', augstats.ecap, ['ecap'])}
                    {this.namedInput('挂件速度', augstats.augspeed, ['augspeed'])}
                    {this.namedInput('黄金', augstats.gold, ['gold'])}
                    {this.namedInput('净每秒黄金', augstats.gps, ['gps'])}
                    {this.namedInput('普通 NAC:', augstats.nac, ['nac'])}
                    {this.namedInput('普通 LSC:', augstats.lsc, ['lsc'])}
                    {this.namedInput('时间', augstats.time, ['time'])}
                    <tr>
                        <td>
                            {'游戏模式:'}
                        </td>
                        <td>
                            {<VersionForm {...this.props} handleChange={this.handleChange}/>}
                        </td>
                    </tr>
                    <tr>
                        <td>{'比例:'}</td>
                        <td>
                            <button onClick={() => this.configureRatios('exponent')}>
                                {'指数'}
                            </button>
                            <button onClick={() => this.configureRatios('cost')}>
                                {'成本'}
                            </button>
                            <button onClick={() => this.configureRatios('equal')}>
                                {'相等'}
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table className='center'>
                    <tbody>
                    <tr>
                        <th>挂件</th>
                        <th>比例</th>
                        <th>挂件<br/>能量</th>
                        <th>升级<br/>能量</th>
                        <th>挂件<br/>等级</th>
                        <th>升级<br/>等级</th>
                        <th>Boost</th>
                    </tr>
                    {
                        AUGS.map((aug, pos) => {
                            return this.augment(augstats, aug, pos);
                        })
                    }
                    </tbody>
                </table>
            </form>
        </div>);

    };
}

export default AugmentComponent;

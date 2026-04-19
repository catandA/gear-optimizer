import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip'
import Modal from 'react-modal';
import ReactGA from 'react-ga';
import {Redirect} from 'react-router-dom';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import {get_max_titan, get_max_zone, get_zone} from '../../util';
import {LOOTIES, PENDANTS} from '../../assets/Items';

import {default as Crement} from '../Crement/Crement';
import {default as ItemTable} from '../ItemTable/ItemTable';
import {default as EquipTable} from '../ItemTable/EquipTable';
import {default as OptimizeButton} from '../OptimizeButton/OptimizeButton';
import {default as FactorForm} from '../FactorForm/FactorForm';
import {default as ItemForm} from '../ItemForm/ItemForm';

import './Optimizer.css';
import ImportSaveForm from '../ImportSaveForm/ImportSaveForm';
import ResetItemsButton from '../ResetItemsButton/ResetItemsButton';
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

Modal.setAppElement('#app');

class Optimizer extends Component {
    static contextType = DarkModeContext;

    constructor(props) {
        super(props);
        this.fresh = true;
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
        if (val < 0) {
            val = 0;
        }
        let stats = {
            ...this.props[name[0] + 'stats'],
            [name[1]]: val
        };
        if (name[0] === 'cube') {
            stats = this.cubeTier(stats, name[1]);
        }
        this.props.handleSettings(name[0] + 'stats', stats);

    }

    cubeTier(cubestats, name) {
        const power = Number(cubestats.power);
        const toughness = Number(cubestats.toughness);
        let tier = Number(cubestats.tier)
        if (name !== 'tier') {
            tier = Math.floor(Math.log10(power + toughness) - 1);
        }
        tier = Math.max(0, tier);
        return {
            ...cubestats,
            tier: tier
        };
    }

    closeEditModal = () => (this.props.handleToggleModal('edit item', {
        itemId: undefined,
        lockable: false,
        on: false
    }));

    render() {
        //HACK: no idea how to do this properly
        if (!this.props.loaded) {
            return <div/>;
        }
        if (this.props.loadLoadout === undefined) {
            ReactGA.pageview('/gear-optimizer/');
        } else {
            if (this.fresh) {
                const loadout = this.props.loadLoadout;
                this.props.handleEquipItems(loadout);
                this.fresh = false;
            } else {
                return <Redirect to='/'/>
            }
        }
        // render the actual optimizer tab
        const zone = get_zone(this.props.zone);
        const maxzone = get_max_zone(this.props.zone);
        const maxtitan = get_max_titan(this.props.zone);
        const accslots = this.props.equip.accessory.length;
        const looty = this.props.looty >= 0
            ? LOOTIES[this.props.looty]
            : '无';
        const pendant = this.props.pendant >= 0
            ? PENDANTS[this.props.pendant]
            : '无';
        return (
            <DndProvider backend={HTML5Backend}>
                <div className={this.props.className}>
                    <div className="content__container">
                        <div className='button-section' key='slots'>
                            <ImportSaveForm/>
                            <button type="button" onClick={() => this.props.handleGo2Titan(8, 3, 5, 12)}>
                                {'泰坦 8 预设'}
                            </button>
                            <button type="button" onClick={() => this.props.handleGo2Titan(11, 6, 8, 15)}>
                                {'泰坦 11 预设'}
                            </button>
                            <ResetItemsButton/>
                            <br/>
                            <div><Crement header='最高冒险区域' value={zone[0]} name='zone'
                                          handleClick={this.props.handleCrement} min={2} max={maxzone}/></div>
                            {
                                this.props.zone > 20
                                    ? <div><Crement header={maxtitan[0] + ' 版本'} value={this.props.titanversion}
                                                    name='titanversion' handleClick={this.props.handleCrement} min={1}
                                                    max={4}/>
                                    </div>
                                    : ''
                            }
                            <div><Crement header='最高战利品者' value={looty} name='looty'
                                          handleClick={this.props.handleCrement} min={-1} max={LOOTIES.length - 1}/>
                            </div>
                            <div><Crement header='最高森林吊坠' value={pendant} name='pendant'
                                          handleClick={this.props.handleCrement} min={-1} max={PENDANTS.length - 1}/>
                            </div>
                            <div><Crement header='饰品槽位' value={accslots} name='accslots'
                                          handleClick={this.props.handleCrement} min={0} max={100}/></div>
                            {
                                this.props.zone > 27
                                    ? <div><Crement header='副手强度' value={this.props.offhand * 5 + '%'}
                                                    name='offhand'
                                                    handleClick={this.props.handleCrement} min={0} max={20}/></div>
                                    : ''
                            }
                        </div>
                        <div className='button-section' key='factorforms'>
                            <OptimizeButton text={'装备'} running={this.props.running}
                                            abort={this.props.handleTerminate}
                                            optimize={this.props.handleOptimizeGear}/>{' '}
                            <button onClick={this.props.handleUndo}>
                                {'加载上一个'}
                            </button>
                            <div className='factor-forms-container'>
                                {[...this.props.factors.keys()].map((idx) => (
                                    <div className='factor-form-row' key={'factorform' + idx}>
                                        <FactorForm {...this.props} idx={idx}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='button-section' key='numberforms'>
                            <table className='center cubetable'>
                                <tbody>
                                <tr>
                                    <td>允许已禁用物品</td>
                                    <td>
                                        <input type="checkbox" checked={this.props.ignoreDisabled}
                                               onChange={() => this.props.handleSettings('ignoreDisabled', !this.props.ignoreDisabled)}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>力量/韧性输入</td>
                                    <td>
                                        <input type="checkbox" checked={this.props.basestats.modifiers}
                                               onChange={(e) => this.props.handleSettings('basestats', {
                                                   ...this.props.basestats,
                                                   modifiers: !this.props.basestats.modifiers
                                               })}/></td>
                                </tr>
                                {
                                    [['power', '力量'], ['toughness', '韧性']].map((stat, idx) => (
                                        <tr className={this.props.basestats.modifiers
                                            ? ''
                                            : 'hide'} key={stat[0]}>
                                            <td>{'基础' + stat[1]}
                                            </td>
                                            <td>
                                                <label>
                                                    <input style={{
                                                        width: '9ch',
                                                        margin: '1ch'
                                                    }} type="number" step="any" value={this.props.basestats[stat[0]]}
                                                           onFocus={this.handleFocus}
                                                           onChange={(e) => this.handleChange(e, ['base', stat[0]])}/>
                                                </label>
                                            </td>
                                        </tr>))
                                }
                                {
                                    [['power', '力量'], ['toughness', '韧性'], ['tier', '层级']].map((stat, idx) => (
                                        <tr className={this.props.basestats.modifiers || stat[0] === 'tier'
                                            ? ''
                                            : 'hide'} key={stat[0]}>
                                            <td>{'立方体' + stat[1]}
                                            </td>
                                            <td>
                                                <label>
                                                    <input style={{
                                                        width: '9ch',
                                                        margin: '1ch'
                                                    }} type="number" step="any" value={this.props.cubestats[stat[0]]}
                                                           onFocus={this.handleFocus}
                                                           onChange={(e) => this.handleChange(e, ['cube', stat[0]])}/>
                                                </label>
                                            </td>
                                        </tr>))
                                }
                                <tr>
                                    <td>硬上限输入</td>
                                    <td>
                                        <input type="checkbox" checked={this.props.capstats.modifiers}
                                               onChange={(e) => this.props.handleSettings('capstats', {
                                                   ...this.props.capstats,
                                                   modifiers: !this.props.capstats.modifiers
                                               })}/>
                                    </td>
                                </tr>
                                {
                                    Object.getOwnPropertyNames(this.props.capstats).map((statname, idx) => {
                                        if (statname.slice(0, 4) !== 'Nude') {
                                            return null;
                                        }
                                        return (<tr className={this.props.capstats.modifiers
                                            ? ''
                                            : 'hide'} key={statname}>
                                            <td>{statname === 'NudeEnergyCap' ? '裸装能量上限' : statname === 'NudeMagicCap' ? '裸装魔力上限' : statname === 'NudeRes3Cap' ? '裸装资源3上限' : statname}
                                            </td>
                                            <td>
                                                <label>
                                                    <input style={{
                                                        width: '9ch',
                                                        margin: '1ch'
                                                    }} type="number" step="any" value={this.props.capstats[statname]}
                                                           onFocus={this.handleFocus}
                                                           onChange={(e) => this.handleChange(e, ['cap', statname])}/>
                                                </label>
                                            </td>
                                        </tr>);
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="content__container">
                        <EquipTable {...this.props} group={'slot'} type='equip'
                                    handleClickItem={this.props.handleUnequipItem}
                                    handleDropItem={this.props.handleDropEquipItem}
                                    handleCtrlClickItem={this.props.handleDisableItem}
                                    handleRightClickItem={(itemId, lockable) => this.props.handleToggleModal('edit item', {
                                        itemId: itemId,
                                        lockable: lockable,
                                        on: true
                                    })}/>
                        <ItemTable {...this.props} maxtitan={maxtitan} group={'zone'} type='items'
                                   handleClickItem={this.props.handleEquipItem}
                                   handleCtrlClickItem={this.props.handleDisableItem}
                                   handleRightClickItem={(itemId) => this.props.handleToggleModal('edit item', {
                                       itemId: itemId,
                                       lockable: false,
                                       on: true
                                   })}/>
                    </div>
                    <Modal className={'edit-item-modal' + (this.context ? ' dark-mode' : '')}
                           overlayClassName='edit-item-overlay' isOpen={this.props.editItem[0]}
                           onAfterOpen={undefined} onRequestClose={this.closeEditModal} style={customStyles}
                           contentLabel='物品编辑模态框' autoFocus={false}>
                        <ItemForm {...this.props} closeEditModal={this.closeEditModal}/>
                    </Modal>
                    <ReactTooltip multiline={true}/>
                </div>

            </DndProvider>);

    };
}

export default Optimizer;

import React, {Component} from 'react';
import Modal from 'react-modal';

import {default as OptimizeButton} from '../OptimizeButton/OptimizeButton';
import SaveForm from '../SaveForm/SaveForm';
import {default as ExportForm} from '../ExportForm/ExportForm'
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

class SaveButtons extends Component {
    static contextType = DarkModeContext;

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.savedequip[this.props.savedidx].ignore
        };
    }

    handleFocus = (event) => {
        event.target.select();
    }

    handleIgnore = (event) => {
        this.setState({
            value: !this.state.value
        });
        let savedequip = [...this.props.savedequip];
        savedequip[this.props.savedidx] = {
            ...savedequip[this.props.savedidx],
            ignore: !savedequip[this.props.savedidx].ignore
        };
        this.props.handleSettings('savedequip', savedequip);
    }

    render() {
        //HACK: this sets the dropdown to the correct value after loading
        if (this.state.value !== this.props.savedequip[this.props.savedidx].ignore) {
            /* eslint-disable-next-line react/no-direct-mutation-state */
            this.state.value = this.props.savedequip[this.props.savedidx].ignore;
        }
        const name = this.props.savedequip[this.props.savedidx].name === undefined
            ? '新建槽位'
            : this.props.savedequip[this.props.savedidx].name;
        return (<div className='item-section'>
            <div style={{
                margin: '5px'
            }}>
                <OptimizeButton text={'所有存档'} running={this.props.running} abort={this.props.handleTerminate}
                                optimize={this.props.handleOptimizeSaves}/>{' '}
                <button onClick={this.props.handleToggleUnused}>
                    {
                        this.props.showunused
                            ? '取消标记未使用物品'
                            : '标记未使用物品'
                    }</button>
                {' '}
                <button key={'export loadout button'}
                        onClick={() => this.setState({open: true})}>{'导出装备方案'}</button>
                <Modal key={'export loadout modal'} className={'port-modal' + (this.context ? ' dark-mode' : '')}
                       overlayClassName='port-overlay'
                       isOpen={this.state.open} onAfterOpen={undefined}
                       onRequestClose={() => (this.setState({open: false}))} style={customStyles}
                       contentLabel='导出装备方案' autoFocus={false}>
                    <ExportForm {...this.props} loadoutURI={this.props.loadoutURI} saveURI={this.props.saveURI}
                                closeExportModal={() => (this.setState({open: false}))}/>
                </Modal>{' '}
            </div>
            <SaveForm {...this.props} loc={['savedidx']} saveIdx={this.props.savedidx}/>
            <div style={{
                margin: '5px'
            }}>
                {/* <Crement header={'Save slot'} value={this.props.savedidx} name='savedidx' handleClick={this.props.handleCrement} min={0} max={this.props.maxsavedidx}/> */}
                <button onClick={this.props.handleSaveSlot}>
                    {'保存'}
                </button>
                <button onClick={this.props.handleLoadSlot}>
                    {'加载'}
                </button>
                <button onClick={() => {
                    if (window.confirm('确定要删除此保存的装备方案吗?')) {
                        this.props.handleDeleteSlot()
                    }
                }}>
                    {'删除'}
                </button>
                <button onClick={this.props.handleToggleSaved}>
                    {
                        this.props.showsaved
                            ? '隐藏'
                            : '显示'
                    }
                </button>
                <button onClick={this.props.handleLoadFactors}>
                    {
                        this.props.savedequip[this.props.savedidx].factors === undefined
                            ? '没有保存的优先级...'
                            : '加载优先级'
                    }
                </button>
            </div>
            <div>
                <input style={{
                    width: '150px',
                    margin: '5px'
                }} value={name} onFocus={this.handleFocus}
                       onChange={(e) => this.props.handleSaveName(e.target.value)}/> {'忽略已使用: '}
                <input type="checkbox" checked={this.state.value} onChange={(e) => this.handleIgnore(e)}/>
            </div>
        </div>);

    };
}

export default SaveButtons;

import React from 'react';

export default class ExportForm extends React.Component {
    handleFocus(event) {
        event.target.select();
    }

    handleClose() {
        this.fresh = true;
        this.props.closeExportModal();
    }

    render() {
        return (<form>
            <table className='center'>
                <tbody>
                <tr>
                    <td>{'当前装备方案: '}
                    </td>
                    <td>
                        <label>
                            <input style={{
                                width: '120px',
                                margin: '10px'
                            }} type="text" value={this.props.loadoutURI} readOnly={true} autoFocus={true}
                                   onFocus={this.handleFocus}/>
                        </label>
                    </td>
                </tr>
                <tr>

                    <td>{'保存的装备方案: '}
                    </td>
                    <td>

                        <label>

                            <input style={{
                                width: '120px',
                                margin: '10px'
                            }} type="text" value={this.props.saveURI} readOnly={true} autoFocus={true}
                                   onFocus={this.handleFocus}/>
                        </label>
                    </td>
                </tr>
                <tr>
                    <td></td>

                    <td>
                        <button onClick={this.props.closeExportModal}>{'关闭'}</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </form>);
    }
}

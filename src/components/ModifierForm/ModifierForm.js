import React from 'react';
import SaveForm from '../SaveForm/SaveForm';

class PotionInput extends React.Component {
    render() {
        const name = this.props.name;
        const type = this.props.piType;
        return (<label>
            <input type="checkbox" checked={this.props[name][this.props.plShort + type + 'Pot']}
                   onChange={(e) => this.props.handleSettings(name, {
                       ...this.props[name],
                       [this.props.plShort + type + 'Pot']: !this.props[name][this.props.plShort + type + 'Pot']
                   })}/>{type}
        </label>);
    }
}

class PotionLine extends React.Component {
    render() {
        return (<tr className={this.props.plHide
            ? ''
            : 'hide'}>
            <td>{this.props.plName}</td>
            <td>
                <PotionInput {...this.props} plShort={this.props.plShort + 'c'} piType={'Beta'}/>
                <PotionInput {...this.props} plShort={this.props.plShort + 'c'} piType={'Delta'}/>
            </td>
            <td>
                <PotionInput {...this.props} piType={'Beta'}/>
                <PotionInput {...this.props} piType={'Delta'}/>
            </td>
        </tr>);
    }
}

export default class ModifierForm extends React.Component {
    render() {
        const name = this.props.name;
        return (<table className='center'>
            <tbody>
            <tr>
                <td>{'高级修改器'}</td>
                <td>
                    <input type="checkbox" checked={this.props[name].modifiers}
                           onChange={(e) => this.props.handleSettings(name, {
                               ...this.props[name],
                               modifiers: !this.props[name].modifiers
                           })}/></td>
            </tr>
            </tbody>
            <tbody className={this.props[name].modifiers
                ? ''
                : 'hide'}>
            <tr>
                <td>当前装备方案</td>
                <td><SaveForm {...this.props} loc={[name, 'currentLoadout']} saveIdx={this.props[name].currentLoadout}/>
                </td>
            </tr>
            <tr>
                <td>专用装备方案</td>
                <td><SaveForm {...this.props} loc={[name, 'dedicatedLoadout']}
                              saveIdx={this.props[name].dedicatedLoadout}/></td>
            </tr>
            <tr className={this.props.e || this.props.m || this.props.r
                ? ''
                : 'hide'}>
                <td>
                    <label>
                        <input type="checkbox" checked={this.props[name].blueHeart}
                               onChange={(e) => this.props.handleSettings(name, {
                                   ...this.props[name],
                                   blueHeart: !this.props[name].blueHeart
                               })}/>
                        蓝心已满级
                    </label>
                </td>
                <td>{'当前'}</td>
                <td>{'专用'}</td>
            </tr>
            <PotionLine {...this.props} plName={'能量药水'} plShort={'e'} plHide={this.props.e}/>
            <PotionLine {...this.props} plName={'魔力药水'} plShort={'m'} plHide={this.props.m}/>
            <PotionLine {...this.props} plName={'资源3药水'} plShort={'r'} plHide={this.props.r}/>
            </tbody>
        </table>);
    }
}

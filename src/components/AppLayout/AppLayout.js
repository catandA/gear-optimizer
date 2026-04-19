import React from 'react';
import CookieBanner from 'react-cookie-banner';
import {HashRouter as Router, NavLink, Route, useParams} from 'react-router-dom';
import ReactGA from 'react-ga';

import './AppLayout.css';

import Optimizer from '../Content/Optimizer';
import Augment from '../Content/Augment';
import NGUComponent from '../Content/NGUs';
import HackComponent from '../Content/Hacks';
import WishComponent from '../Content/Wishes';
import AboutComponent from '../About/About';

import DarkModeContext from './DarkModeContext';

function HowTo() {
    ReactGA.pageview('/howto');
    return <div className='howto'>
        <ol>
            {'装备优化器使用说明：'}
        </ol>
        <ol>
            <li>根据游戏进度进行全局物品设置。
                <ul>
                    <li>选择你的最高区域。</li>
                    <li>如果适用，选择最高泰坦的最高版本。</li>
                    <li>选择你的最高战利品版本。</li>
                    <li>选择你的最高飞升吊坠版本。</li>
                    <li>选择你的饰品栏位数量。</li>
                </ul>
                <br/>
            </li>
            <li>在右侧物品列表中进行额外的自定义物品配置。
                <ul>
                    <li>点击区域名称来展开/折叠该区域的物品列表。</li>
                    <li>右键点击列表中的物品打开物品编辑菜单。</li>
                    <li>在物品编辑菜单中启用或禁用物品，或更改其等级。</li>
                    <li>点击列表中的物品来装备它。</li>
                    <li>已装备的物品可以在左侧装备列表中右键点击来锁定。</li>
                </ul>
                <br/>
            </li>
            <li>便捷快捷键：
                <ul>
                    <li>Shift+点击物品：将物品等级设为 100（如果已经是 100 则设为 0）。</li>
                    <li>Ctrl+点击或 Alt+点击物品：切换物品的启用/禁用状态。</li>
                    <li>点击区域名称：折叠或展开该区域的物品列表。</li>
                    <li>Shift+点击区域名称：开启/关闭该区域物品列表的紧凑模式。紧凑模式将所有区域物品放在一个列表中，并隐藏所有禁用的物品。禁用的物品仍然可以在页面左下角的禁用物品列表中找到。
                    </li>
                    <li>Ctrl+点击或 Alt+点击区域名称：切换该区域所有物品的启用/禁用状态。
                    </li>
                </ul>
                <br/>
            </li>
            <li>配置基础力量/韧性、无限立方体和硬上限信息。
                <ul>
                    <li>基础值和立方体 PT 很直观。更改立方体 PT 时会自动计算立方体层级，但也可以手动调整。
                    </li>
                    <li>如果你接近某个特定值的硬上限（例如 EM 上限），装备优化器可以考虑到这一点。在相应字段中输入你的裸装总值，即不装备任何装备时的总值。要找到这个值，你可以卸下所有装备或者自己计算。
                    </li>
                </ul>
                <br/>
            </li>
            <li>选择你的优先级。
                <ul>
                    <li>优先级从上到下处理（优先级 1 为最高）。</li>
                    <li>当针对某个优先级进行优化时，优化器会为该优先级计算最优装备方案，仅考虑之前优先级未使用的空槽位。
                    </li>
                    <li>槽位数量限制了可用于此优先级的额外饰品栏位数。
                    </li>
                    <li>当然，全局饰品栏位限制始终适用，可能的情况是列表下方优先级没有剩余槽位可用。
                    </li>
                </ul>
                <br/>
            </li>
            <li>点击"优化装备"按钮，基于当前配置计算最优装备方案。</li>
            <br/>
            <li>保存和对比装备方案。
                <ul>
                    <li>属性列表显示当前装备方案的属性以及与当前选中存档槽位的差异。
                    </li>
                    <li>默认存档槽位为空。覆盖最后一个存档槽位会在下一个索引处创建新的空存档。
                    </li>
                    <li>通过点击相应按钮来保存/加载/删除存档槽位。通过增加/减少存档索引来浏览存档。
                    </li>
                    <li>删除槽位会移除该存档，所有更高索引的存档索引都会减 1。
                    </li>
                    <li>可以通过点击显示/隐藏按钮来显示或隐藏当前保存的装备方案。</li>
                </ul>
            </li>
        </ol>
        <br/>
        <ol>
            {'挂件计算器使用说明：'}
        </ol>
        <ol>
            <li>填写字段然后查看哪个挂件提供最佳提升。</li>
            <li>挂件速度是你在详细数据中找到的数值，但要除以 100 来去掉 "%" 符号。</li>
            <li>时间单位为分钟。</li>
            <li>比例是 挂件中的能量 : 升级中的能量，后者始终为 1。例如如果你想要 3.4:2 的比例，则输入 1.7。
            </li>
        </ol>
        <br/>
        <ol>
            {'NGU 计算器使用说明：'}
        </ol>
        <ol>
            <li>填写字段然后查看哪个 NGU 提供最佳提升。</li>
            <li>NGU 速度是你在详细数据中找到的数值，但要除以 100 来去掉 "%" 符号。</li>
            <li>时间单位为分钟。</li>
            <li>请记住，计算器假设你将所有 E 或 M 分配给单个 NGU。</li>
        </ol>
        <br/>
        <ol>
            {'黑客计算器使用说明：'}
        </ol>
        <ol>
            <li>填写字段然后从三个选项中选择一个（目标、最大等级、最大 MS）。</li>
            <li>MS 表示里程碑。MS 减少器是你降低了多少里程碑之间的等级数。例如如果默认每里程碑等级数是 10，但你的是 8，则填入 2。
                </li>
            <li>黑客速度是你在详细数据中找到的数值，但要除以 100 来去掉 "%" 符号。</li>
            <li>时间单位为分钟。</li>
            <li>最短总时间假设你先运行 Hack Hack。最长总时间假设你最后运行 Hack Hack，这是"时间"列中时间的总和，这些时间基于当前的黑客速度。
                </li>
        </ol>
        <br/>
        <ol>
            {'许愿计算器使用说明：'}
        </ol>
        <ol>
            <li>在所有输入字段中提供所需的数据，请考虑使用科学计数法，例如用 1e6 而不是 1000000，或者享受数零的乐趣。
                </li>
            <li>力量是总力量，上限是你实际想要花费在许愿上的数量。</li>
            <li>例如：如果你同样重视黑客和许愿，那么你可以将 R3 上限设置为你总 R3 上限的 22.44%。
                </li>
            <li>从详细菜单中获取许愿速度修正值并将其写为小数，即 "100%" 变为 "1.00"。
                </li>
            <li>最小许愿时间是你希望最终等级所花费的时间。</li>
            <li>选择一些许愿、起始等级和目标等级。</li>
            <li>决定资源消耗的顺序。</li>
            <li>系统将建议可能的 EMR 上限分配方案，以便在尽可能短的时间内达到每个许愿的目标等级。这个过程是随机的，因此重新运行可能会产生（略微）不同的结果。
                </li>
        </ol>
        <br/>
        <ol>
            {'高级修改器使用说明：'}
        </ol>
        <ol>
            <li>你不一定要使用这些修改器，但它们可以让你的操作更轻松。</li>
            <li>例如你可以保存、装备专用装备、喝下药水，然后将力量/上限/速度/... 值复制到相应的字段中以获得准确的计算，然后重新加载这样你就不会浪费药水或资源分配了。
                </li>
            <li>使用高级修改器时，你根据当前穿戴的装备和当前激活的药水来输入所有这些值。</li>
            <li>高级修改器字段随后用于根据你输入的值计算你的 ngu/黑客/许愿/... 速度，以及当前运行和计划运行之间的装备和药水变化。
                </li>
            <br/>
            <li>当前 [某项]：指你在填写力量/上限/速度/... 字段时正在使用的 [某项]。
            </li>
            <li>专用 [某项]：指你将在 ngu/黑客/许愿/... 运行中使用的 [某项]。</li>
        </ol>
        <br/>
        <ol>
            {'乘法修正：'}
        </ol>
        <ol>
            <li>在游戏的属性详细数据中，这些以百分比形式给出。</li>
            <li>各种优化器则需要原始的小数数值。</li>
            <li>例如，1.2e34% 的修正应该输入为 1.2e32。</li>
        </ol>
    </div>;
}


const AppLayout = props => {
    const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('dark-mode') === true.toString());
    const toggleDarkMode = () => {
        localStorage.setItem('dark-mode', !darkMode)
        setDarkMode(v => !v);
    };
    let className = 'app_container';
    if (darkMode) {
        className += ' dark-mode';
    }
    return (
        <div className={className}>
            <CookieBanner styles={{
                banner: {
                    height: 'auto'
                },
                message: {
                    fontWeight: 400
                }
            }}
                          message='本页面希望使用本地存储和cookie来分别跟踪您的配置和同意。滚动或点击以接受。'
            />
            <DarkModeContext.Provider value={darkMode}>
                <Router>
                    <div>
                        <nav>
                            <ul className='nav-bar-list'>
                                <li className='nav-bar-item'>
                                    <NavLink to='/' exact={true} className='nav-link'
                                             activeClassName='active'>装备</NavLink>
                                </li>
                                <li className='nav-bar-item'>
                                    <NavLink to='/augment' exact={true} className='nav-link'
                                             activeClassName='active'>挂件</NavLink>
                                </li>
                                <li className='nav-bar-item'>
                                    <NavLink to='/ngus' exact={true} className='nav-link'
                                             activeClassName='active'>NGU</NavLink>
                                </li>
                                <li className='nav-bar-item'>
                                    <NavLink to='/hacks' exact={true} className='nav-link'
                                             activeClassName='active'>黑客</NavLink>
                                </li>
                                <li className='nav-bar-item'>
                                    <NavLink to='/wishes' exact={true} className='nav-link'
                                             activeClassName='active'>许愿</NavLink>
                                </li>
                                <li className='nav-bar-item'>
                                    <NavLink to='/howto' exact={true} className='nav-link' activeClassName='active'>怎么用？</NavLink>
                                </li>
                                <div className="nav-bar-item-separator"></div>
                                <li className='nav-bar-item'>
                                    <div className="nav-link" style={{cursor: 'pointer', userSelect: 'none'}}
                                         onClick={toggleDarkMode}>
                                        黑暗模式
                                    </div>
                                </li>
                                <li className='nav-bar-item'>
                                    <NavLink to='/about/' exact={true} className='nav-link'
                                             activeClassName='active'>关于</NavLink>
                                </li>
                            </ul>
                        </nav>

                        <Route exact={true} path='/'
                               render={(routeProps) => (<Optimizer {...routeProps} {...props} className='app_body'/>)}/>
                        <Route exact={true} path='/loadout/'
                               render={(routeProps) => (<Optimizer {...routeProps} {...props} className='app_body'/>)}/>
                        <Route exact={true} path='/loadout/:itemlist' children={<Loadout {
                                                                                             ...props
                                                                                         } />}/>
                        <Route exact={true} path='/howto/' component={HowTo}/>
                        <Route exact={true} path='/augment/'
                               render={(routeProps) => (<Augment {...routeProps} {...props} className='app_body'/>)}/>
                        <Route exact={true} path='/ngus/'
                               render={(routeProps) => (
                                   <NGUComponent {...routeProps} {...props} className='app_body'/>)}/>
                        <Route exact={true} path='/hacks/'
                               render={(routeProps) => (
                                   <HackComponent {...routeProps} {...props} className='app_body'/>)}/>
                        <Route exact={true} path='/wishes/'
                               render={(routeProps) => (
                                   <WishComponent {...routeProps} {...props} className='app_body'/>)}/>
                        <Route exact={true} path='/about/'
                               render={(routeProps) => (
                                   <AboutComponent {...routeProps} {...props} className='app_body'/>)}/>
                    </div>
                </Router>
            </DarkModeContext.Provider>
        </div>
    )
};

const Loadout = (props) => {
    let {itemlist} = useParams();
    itemlist = itemlist.split('&');
    return <Optimizer {...props} loadLoadout={itemlist} className='app_body'/>;
}

export default AppLayout;

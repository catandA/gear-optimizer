import React, {Component} from 'react';
import NGUIntegration from '../../lib/NGUIntegration';
import './NGUIntegrationPanel.css';

var STATUS_LABELS = {
    equipped: '装备',
    nakedemr: '裸装 EMR3',
    augstats: '挂件',
    ngustats: 'NGU 数据',
    hacks_with_targets: '黑客(含目标)',
    hacks_no_targets: '黑客(保留目标)',
    wishstats: '许愿',
    loadouts: '配置方案',
    send_hacks: '黑客目标',
    all: '全部'
};

class NGUIntegrationPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            syncing: false,
            status: {},
            lastSyncTime: null,
            slotName: '',
            customSlotName: '',
            useCurrentSlot: true
        };
        this.togglePanel = this.togglePanel.bind(this);
        this.syncEquipped = this.syncEquipped.bind(this);
        this.syncNakedEMR = this.syncNakedEMR.bind(this);
        this.syncAugStats = this.syncAugStats.bind(this);
        this.syncNGUStats = this.syncNGUStats.bind(this);
        this.syncHackStats = this.syncHackStats.bind(this);
        this.syncHackTargets = this.syncHackTargets.bind(this);
        this.syncWishStats = this.syncWishStats.bind(this);
        this.sendLoadouts = this.sendLoadouts.bind(this);
        this.syncAllFromNGU = this.syncAllFromNGU.bind(this);
    }

    componentDidMount() {
        var currentSlotName = this.getCurrentSlotDisplayName();
        this.setState({ slotName: currentSlotName });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.savedidx !== this.props.savedidx ||
            prevProps.savedequip !== this.props.savedequip) {
            var currentSlotName = this.getCurrentSlotDisplayName();
            if (!this.state.syncing) {
                this.setState({ slotName: currentSlotName });
            }
        }
        if (this.isCurrentSlotEmpty() && this.state.useCurrentSlot) {
            var slots = this.getAvailableSlots();
            if (slots.length > 0) {
                var firstNew = slots.find(function(s) { return s.isNewEmpty; });
                if (firstNew) {
                    this.setState({
                        useCurrentSlot: false,
                        slotName: firstNew.rawName || firstNew.name,
                        customSlotName: '新存档 #' + firstNew.index
                    });
                }
            }
        }
    }

    getCurrentSlotDisplayName() {
        if (!this.props.savedequip || !Array.isArray(this.props.savedequip)) return 'current';
        var idx = this.props.savedidx || 0;
        if (idx >= this.props.savedequip.length) return 'current';
        var slot = this.props.savedequip[idx];
        return slot && slot.name ? slot.name : ('槽位' + idx);
    }

    isCurrentSlotEmpty() {
        if (!this.props.savedequip || !Array.isArray(this.props.savedequip)) return true;
        var idx = this.props.savedidx || 0;
        if (idx >= this.props.savedequip.length) return true;
        var slot = this.props.savedequip[idx];
        return !slot || !slot.name || slot.name === '';
    }

    getSelectedSlotInfo() {
        var slots = this.getAvailableSlots();
        var targetName = this.state.useCurrentSlot ? this.getCurrentSlotDisplayName() : this.state.slotName;
        var found = slots.find(function(s) { return s.rawName === targetName || s.name === targetName; });
        return found || null;
    }

    getEffectiveSlotName() {
        if (this.state.useCurrentSlot) {
            return this.getCurrentSlotDisplayName();
        }
        var selected = this.getSelectedSlotInfo();
        if (selected && selected.isNewEmpty && this.state.customSlotName) {
            return this.state.customSlotName;
        }
        return this.state.slotName || this.getCurrentSlotDisplayName();
    }

    getAvailableSlots() {
        if (!this.props.savedequip || !Array.isArray(this.props.savedequip)) {
            return [];
        }
        var slots = [];
        for (var i = 0; i < this.props.savedequip.length; i++) {
            var slot = this.props.savedequip[i];
            var isEmpty = !slot.name || slot.name === '';
            var displayName = isEmpty ? ('新建槽位 #' + i) : (slot.name || ('槽位' + i));
            slots.push({
                index: i,
                name: displayName,
                rawName: slot.name || '',
                isCurrent: i === (this.props.savedidx || 0),
                isNewEmpty: isEmpty
            });
        }
        return slots;
    }

    togglePanel() {
        this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }

    updateStatus(key, status, message) {
        this.setState(prevState => ({
            status: { ...prevState.status, [key]: { status, message } }
        }));
    }

    getStatusLabel(key) {
        return STATUS_LABELS[key] || key;
    }

    syncEquipped() {
        var self = this;
        var targetSlot = self.getEffectiveSlotName();
        var selected = self.getSelectedSlotInfo();
        var slotIndex = selected ? selected.index : (self.props.savedidx || 0);
        self.updateStatus('equipped', 'syncing', '正在从游戏导入装备到 "' + targetSlot + '"...');
        self.setState({ syncing: true });

        NGUIntegration.ngu2go_equipped(self.props.savedequip, targetSlot, slotIndex)
            .then(function(result) {
                self.props.handleSettings(result.key, result.value);
                self.updateStatus('equipped', 'success', '✓ ' + self.getStatusLabel('equipped') + ' 已导入到 "' + targetSlot + '"');
            })
            .catch(function(error) {
                self.updateStatus('equipped', 'error', '✗ 导入失败: ' + (error.message || '无法连接到游戏，请确保游戏正在运行'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    syncNakedEMR() {
        var self = this;
        self.updateStatus('nakedemr', 'syncing', '正在导入裸装 EMR3...');
        self.setState({ syncing: true });

        NGUIntegration.ngu2go_nakedemr3(self.props.capstats)
            .then(function(result) {
                self.props.handleSettings(result.key, result.value);
                self.updateStatus('nakedemr', 'success', '✓ ' + self.getStatusLabel('nakedemr') + ' 已导入');
            })
            .catch(function(error) {
                self.updateStatus('nakedemr', 'error', '✗ 导入失败: ' + (error.message || '无法连接到游戏'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    syncAugStats() {
        var self = this;
        self.updateStatus('augstats', 'syncing', '正在导入挂件数据...');
        self.setState({ syncing: true });

        NGUIntegration.ngu2go_augstats(self.props.augstats)
            .then(function(result) {
                self.props.handleSettings(result.key, result.value);
                self.updateStatus('augstats', 'success', '✓ ' + self.getStatusLabel('augstats') + ' 已导入');
            })
            .catch(function(error) {
                self.updateStatus('augstats', 'error', '✗ 导入失败: ' + (error.message || '无法连接到游戏'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    syncNGUStats() {
        var self = this;
        self.updateStatus('ngustats', 'syncing', '正在导入 NGU 数据...');
        self.setState({ syncing: true });

        NGUIntegration.ngu2go_ngustats(self.props.ngustats)
            .then(function(result) {
                self.props.handleSettings(result.key, result.value);
                self.updateStatus('ngustats', 'success', '✓ ' + self.getStatusLabel('ngustats') + ' 已导入');
            })
            .catch(function(error) {
                self.updateStatus('ngustats', 'error', '✗ 导入失败: ' + (error.message || '无法连接到游戏'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    syncHackStats(resetTargets) {
        var self = this;
        var key = resetTargets ? 'hacks_with_targets' : 'hacks_no_targets';
        self.updateStatus(key, 'syncing', '正在导入' + self.getStatusLabel(key) + '...');
        self.setState({ syncing: true });

        NGUIntegration.ngu2go_hacks(self.props.hackstats, resetTargets)
            .then(function(result) {
                self.props.handleSettings(result.key, result.value);
                self.updateStatus(key, 'success', '✓ ' + self.getStatusLabel(key) + ' 已导入');
            })
            .catch(function(error) {
                self.updateStatus(key, 'error', '✗ 导入失败: ' + (error.message || '无法连接到游戏'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    syncHackTargets() {
        var self = this;
        self.updateStatus('send_hacks', 'syncing', '正在发送黑客目标到游戏...');
        self.setState({ syncing: true });

        NGUIntegration.go2ngu_hacks(self.props.hackstats)
            .then(function() {
                self.updateStatus('send_hacks', 'success', '✓ ' + self.getStatusLabel('send_hacks') + ' 已发送到游戏');
            })
            .catch(function(error) {
                self.updateStatus('send_hacks', 'error', '✗ 发送失败: ' + (error.message || '无法连接到游戏'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    syncWishStats() {
        var self = this;
        self.updateStatus('wishstats', 'syncing', '正在导入许愿数据...');
        self.setState({ syncing: true });

        NGUIntegration.ngu2go_wishstats(self.props.wishstats)
            .then(function(result) {
                self.props.handleSettings(result.key, result.value);
                self.updateStatus('wishstats', 'success', '✓ ' + self.getStatusLabel('wishstats') + ' 已导入');
            })
            .catch(function(error) {
                self.updateStatus('wishstats', 'error', '✗ 导入失败: ' + (error.message || '无法连接到游戏'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    sendLoadouts() {
        var self = this;
        self.updateStatus('loadouts', 'syncing', '正在发送配置方案到游戏...');
        self.setState({ syncing: true });

        NGUIntegration.go2ngu_loadouts(self.props.savedequip)
            .then(function() {
                self.updateStatus('loadouts', 'success', '✓ ' + self.getStatusLabel('loadouts') + ' 已发送到游戏');
            })
            .catch(function(error) {
                self.updateStatus('loadouts', 'error', '✗ 发送失败: ' + (error.message || '无法连接到游戏'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    syncAllFromNGU() {
        var self = this;
        var targetSlot = self.getEffectiveSlotName();
        var selected = self.getSelectedSlotInfo();
        var slotIndex = selected ? selected.index : (self.props.savedidx || 0);

        self.setState({
            syncing: true,
            status: {
                all: { status: 'syncing', message: '⏳ 正在从游戏同步所有数据到 "' + targetSlot + '"...' },
                equipped: null,
                nakedemr: null,
                augstats: null,
                ngustats: null,
                hacks_with_targets: null,
                wishstats: null
            }
        });

        var currentState = {
            savedequip: self.props.savedequip,
            capstats: self.props.capstats,
            augstats: self.props.augstats,
            ngustats: self.props.ngustats,
            hackstats: self.props.hackstats,
            wishstats: self.props.wishstats
        };

        var results = {};
        var errors = [];

        function handleResult(key, result) {
            results[key] = result;
            if (result) {
                self.props.handleSettings(result.key, result.value);
                self.updateStatus(key, 'success', '✓ ' + self.getStatusLabel(key) + ' 完成');
            }
        }

        function handleError(key, error) {
            errors.push(self.getStatusLabel(key) + ': ' + (error.message || '未知错误'));
            self.updateStatus(key, 'error', '✗ ' + self.getStatusLabel(key) + ' 失败');
        }

        NGUIntegration.ngu2go_equipped(currentState.savedequip, targetSlot, slotIndex)
            .then(function(result) {
                handleResult('equipped', result);
                return NGUIntegration.ngu2go_nakedemr3(currentState.capstats);
            })
            .then(function(result) {
                handleResult('nakedemr', result);
                return NGUIntegration.ngu2go_augstats(currentState.augstats);
            })
            .then(function(result) {
                handleResult('augstats', result);
                return NGUIntegration.ngu2go_ngustats(currentState.ngustats);
            })
            .then(function(result) {
                handleResult('ngustats', result);
                return NGUIntegration.ngu2go_hacks(currentState.hackstats, true);
            })
            .then(function(result) {
                handleResult('hacks_with_targets', result);
                return NGUIntegration.ngu2go_wishstats(currentState.wishstats);
            })
            .then(function(result) {
                handleResult('wishstats', result);

                var successCount = Object.keys(results).length;
                var totalCount = 6;

                if (errors.length === 0) {
                    self.updateStatus('all', 'success',
                        '✅ 全部完成！' + successCount + '/' + totalCount + ' 项已同步 → "' + targetSlot + '"');
                } else {
                    self.updateStatus('all', 'warning',
                        '⚠️ 部分完成: ' + successCount + '/' + totalCount + ' 成功，' + errors.length + ' 项失败');
                }
            })
            .catch(function(error) {
                self.updateStatus('all', 'error',
                    '❌ 同步中断: ' + (error.message || '无法连接到游戏，请确保游戏正在运行并安装了 jshepler.ngu.mods'));
            })
            .finally(function() {
                self.setState({ syncing: false, lastSyncTime: new Date() });
            });
    }

    render() {
        var self = this;
        var statusClass = self.state.isOpen ? ' open' : '';
        var availableSlots = self.getAvailableSlots();
        var effectiveSlot = self.getEffectiveSlotName();

        return (
            <div className={'ngu-integration' + statusClass}>
                <button className="ngu-integration__toggle"
                        onClick={self.togglePanel}
                        title="NGU 游戏同步">
                    🎮 NGU 同步
                </button>

                {self.state.isOpen && (
                    <div className="ngu-integration__panel">
                        <div className="ngu-integration__header">
                            <h3>🎮 NGU 游戏数据同步</h3>
                            <button className="ngu-integration__close"
                                    onClick={self.togglePanel}>✕</button>
                        </div>

                        <div className="ngu-integration__info">
                            <p>通过 localhost:8088 与 NGU Idle 游戏双向同步（需安装 jshepler.ngu.mods）</p>

                            <div className="ngu-integration__slot-selector">
                                <label className={
                                    'ngu-checkbox-label ngu-checkbox-label--primary' +
                                    (self.isCurrentSlotEmpty() ? ' ngu-checkbox-label--disabled' : '')
                                }>
                                    <input
                                        type="checkbox"
                                        checked={self.state.useCurrentSlot && !self.isCurrentSlotEmpty()}
                                        disabled={self.isCurrentSlotEmpty()}
                                        onChange={(e) => self.setState({ useCurrentSlot: e.target.checked })}
                                    />
                                    导入到当前查看的存档（{effectiveSlot}）
                                    {self.isCurrentSlotEmpty() && (
                                        <span className="ngu-hint-text"> — 当前为空槽位，请选择其他存档</span>
                                    )}
                                </label>

                                {(!self.state.useCurrentSlot || self.isCurrentSlotEmpty()) && (
                                    <div className="ngu-slot-select-wrapper">
                                        <label>选择目标存档：</label>
                                        <select
                                            value={self.state.slotName}
                                            onChange={(e) => {
                                                var val = e.target.value;
                                                var slots = self.getAvailableSlots();
                                                var selected = slots.find(function(s) { return s.rawName === val || s.name === val; });
                                                self.setState({
                                                    slotName: val,
                                                    customSlotName: (selected && selected.isNewEmpty) ? ('新存档 #' + selected.index) : ''
                                                });
                                            }}
                                            className="ngu-slot-select"
                                        >
                                            {availableSlots.map(function(slot) {
                                                return (
                                                    <option key={slot.index} value={slot.rawName || slot.name}>
                                                        {slot.isCurrent ? '→ ' : '  '}
                                                        {slot.name} (#{slot.index})
                                                        {slot.isNewEmpty ? ' [新建]' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        {(function() {
                                            var selected = self.getSelectedSlotInfo();
                                            if (selected && selected.isNewEmpty) {
                                                return (
                                                    <div className="ngu-custom-name-input">
                                                        <label>新存档名称：</label>
                                                        <input
                                                            type="text"
                                                            className="ngu-custom-input"
                                                            value={self.state.customSlotName}
                                                            onChange={(e) => self.setState({ customSlotName: e.target.value })}
                                                            placeholder={'新存档 #' + (selected.index || '')}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ngu-integration__section">
                            <h4>📥 从游戏导入到 GO</h4>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.syncAllFromNGU}
                                        disabled={self.state.syncing}
                                        className="ngu-btn ngu-btn--primary">
                                    ⚡ 一键全部导入 → "{effectiveSlot}"
                                </button>
                                {self.statusDisplay('all')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.syncEquipped}
                                        disabled={self.state.syncing}
                                        className="ngu-btn">
                                    👕 当前装备 → GO
                                </button>
                                {self.statusDisplay('equipped')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.syncNakedEMR}
                                        disabled={self.state.syncing}
                                        className="ngu-btn">
                                    💪 裸装 EMR3 → GO
                                </button>
                                {self.statusDisplay('nakedemr')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.syncAugStats}
                                        disabled={self.state.syncing}
                                        className="ngu-btn">
                                    🔧 挂件数据 → GO
                                </button>
                                {self.statusDisplay('augstats')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.syncNGUStats}
                                        disabled={self.state.syncing}
                                        className="ngu-btn">
                                    🌱 NGU 数据 → GO
                                </button>
                                {self.statusDisplay('ngustats')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={() => self.syncHackStats(true)}
                                        disabled={self.state.syncing}
                                        className="ngu-btn">
                                    💻 黑客(含目标) → GO
                                </button>
                                {self.statusDisplay('hacks_with_targets')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={() => self.syncHackStats(false)}
                                        disabled={self.state.syncing}
                                        className="ngu-btn">
                                    💻 黑客(保留目标) → GO
                                </button>
                                {self.statusDisplay('hacks_no_targets')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.syncWishStats}
                                        disabled={self.state.syncing}
                                        className="ngu-btn">
                                    ⭐ 许愿数据 → GO
                                </button>
                                {self.statusDisplay('wishstats')}
                            </div>
                        </div>

                        <div className="ngu-integration__section">
                            <h4>📤 从 GO 导出到游戏</h4>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.sendLoadouts}
                                        disabled={self.state.syncing}
                                        className="ngu-btn ngu-btn--export">
                                    🎒 配置方案 → 游戏
                                </button>
                                {self.statusDisplay('loadouts')}
                            </div>

                            <div className="ngu-integration__buttons">
                                <button onClick={self.syncHackTargets}
                                        disabled={self.state.syncing}
                                        className="ngu-btn ngu-btn--export">
                                    🎯 黑客目标 → 游戏
                                </button>
                                {self.statusDisplay('send_hacks')}
                            </div>
                        </div>

                        {self.state.lastSyncTime && (
                            <div className="ngu-integration__footer">
                                上次同步: {self.state.lastSyncTime.toLocaleTimeString()}
                                {availableSlots.length > 0 && (
                                    <span className="ngu-footer-info">
                                        | 当前查看: #{self.props.savedidx || 0}/{Math.max(0, (self.props.savedequip || []).length - 1)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    statusDisplay(key) {
        var status = this.state.status[key];
        if (!status) return null;

        var className = 'ngu-status ngu-status--' + status.status;
        return <span className={className}>{status.message}</span>;
    }
}

export default NGUIntegrationPanel;

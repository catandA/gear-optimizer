const BASE_URL = 'http://localhost:8088/ngu';

function apiGet(endpoint) {
    return fetch(BASE_URL + endpoint)
        .then(function(resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status + ': ' + resp.statusText);
            return resp.json();
        });
}

function apiPost(endpoint, body) {
    return fetch(BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status + ': ' + resp.statusText);
        return resp;
    });
}

var NGUIntegration = {

    go2ngu_loadouts: function(savedequip) {
        return apiPost('/go2ngu/loadouts', savedequip);
    },

    ngu2go_equipped: function(savedequip, slotName, slotIndex) {
        slotName = slotName || 'current';
        return apiGet('/ngu2go/equipped').then(function(gear) {
            var data = savedequip;
            var slot = data.find(function(s) { return s.name === slotName; });
            if (!slot && typeof slotIndex === 'number' && slotIndex >= 0 && slotIndex < data.length) {
                slot = data[slotIndex];
            }
            if (slot) {
                Object.assign(slot, gear);
                if (slotName !== 'current' && (!slot.name || slot.name === '')) {
                    slot.name = slotName;
                }
            }
            return { key: 'savedequip', value: data, gear: gear };
        });
    },

    ngu2go_nakedemr3: function(capstats) {
        return apiGet('/ngu2go/nakedemr').then(function(data) {
            var newCapstats = Object.assign({}, capstats, data);
            return { key: 'capstats', value: newCapstats, data: data };
        });
    },

    ngu2go_augstats: function(augstats) {
        return apiGet('/NGU2GO/augstats').then(function(data) {
            var newAugstats = Object.assign({}, augstats, data);
            return { key: 'augstats', value: newAugstats, data: data };
        });
    },

    ngu2go_ngustats: function(ngustats) {
        return apiGet('/NGU2GO/ngustats').then(function(data) {
            var newNgustats = Object.assign({}, ngustats, data);
            return { key: 'ngustats', value: newNgustats, data: data };
        });
    },

    ngu2go_hacks: function(hackstats, resetTargets) {
        resetTargets = (resetTargets === undefined) ? true : resetTargets;
        return apiGet('/ngu2go/hacks').then(function(o) {
            var h = JSON.parse(JSON.stringify(hackstats));
            h.rpow = o.rpow;
            h.rcap = o.rcap;
            h.hackspeed = o.hackspeed;
            for (var x = 0; x < 15; x++) {
                h.hacks[x].level = o.hacks[x].level;
                h.hacks[x].reducer = o.hacks[x].reducer;
                if (resetTargets) {
                    h.hacks[x].goal = o.hacks[x].level;
                }
            }
            return { key: 'hackstats', value: h, data: o };
        });
    },

    go2ngu_hacks: function(hackstats) {
        var goals = hackstats.hacks.map(function(h) { return h.goal; });
        return apiPost('/go2ngu/hacks', goals);
    },

    ngu2go_wishstats: function(wishstats) {
        return apiGet('/NGU2GO/wishstats').then(function(data) {
            var newWishstats = Object.assign({}, wishstats, data);
            return { key: 'wishstats', value: newWishstats, data: data };
        });
    },

    syncAllFromNGU: function(currentState) {
        var self = this;
        var results = {};
        var errors = [];

        return self.ngu2go_equipped(currentState.savedequip)
            .then(function(result) {
                results.savedequip = result;
                return self.ngu2go_nakedemr3(currentState.capstats);
            })
            .then(function(result) {
                results.capstats = result;
                return self.ngu2go_augstats(currentState.augstats);
            })
            .then(function(result) {
                results.augstats = result;
                return self.ngu2go_ngustats(currentState.ngustats);
            })
            .then(function(result) {
                results.ngustats = result;
                return self.ngu2go_hacks(currentState.hackstats, true);
            })
            .then(function(result) {
                results.hackstats = result;
                return self.ngu2go_wishstats(currentState.wishstats);
            })
            .then(function(result) {
                results.wishstats = result;
                return { success: true, results: results, errors: errors };
            })
            .catch(function(error) {
                errors.push(error.message || error.toString());
                return { success: false, results: results, errors: errors };
            });
    }
};

export default NGUIntegration;
export { BASE_URL };

const easyBag = [
    'p1',
    'p1',
    '0',
    '0',
    '0',
    'm1',
    'm1',
    'm1',
    'm2',
    'm2',
    'skull',
    'skull',
    'cultist',
    'tablet',
    'doom',
    'special',
];

const normalBag = [
    'p1',
    '0',
    '0',
    'm1',
    'm1',
    'm1',
    'm2',
    'm2',
    'm3',
    'm4',
    'skull',
    'skull',
    'cultist',
    'tablet',
    'doom',
    'special',
];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

let tokenRotated = false;

const bagSelector = document.getElementById('bagSelector');

function updateTokenImg(value) {
    document.querySelector('img[data-token]').setAttribute('src', getTokenSrc(value));
}

function getTokenSrc(value) {
    return 'assets/' + value + '.png';
}

function randomToken(tokens) {
    if (tokenRotated) {
        return;
    }

    const tokenValue = getRandomInt(0, tokens.length);
    const tokenImg = document.querySelector('img[data-token]');

    if (tokenImg.getAttribute('src') === '') {
        updateTokenImg(tokens[tokenValue]);
        return;
    }

    tokenRotated = true;
    tokenImg.classList.add('flip');
    setTimeout(() => {
        updateTokenImg(tokens[tokenValue]);
        tokenImg.classList.remove('flip');
        tokenRotated = false;
    }, 2000);
}

class ChaosBag {
    constructor(content) {
        this.additionalTokens = [];
        this.content = [...content];
    }

    setStandardBag(content) {
        this.content = [...content];
    }

    tokens() {
        return [...this.content.concat(this.additionalTokens)];
    }

    standardBag() {
        return [...this.content];
    }

    additionals() {
        return [...this.additionalTokens];
    }

    addToken(token) {
        this.additionalTokens.push(token);
    }

    removeToken(token) {
        const tokenIdx = this.additionalTokens.indexOf(token);
        if (tokenIdx > -1) {
            this.additionalTokens.splice(tokenIdx, 1);
        }
    }

    resetAdditionalTokens() {
        this.additionalTokens = [];
    }

    calcPercent(calcToken) {
        const tokens = this.content.concat(this.additionalTokens);
        const tokensByName = {};
        tokens.forEach(token => {
            tokensByName[token] = tokensByName[token] || 0;
            tokensByName[token]++;
        });

        if (tokensByName[calcToken] === undefined) {
            return 0.0;
        }

        return tokensByName[calcToken] / tokens.length * 100;
    }
}

const chaosBag = new ChaosBag(easyBag);

const app = Vue.createApp({
    data() {
        return {
            chaosBag: chaosBag,
            easyBag: easyBag,
            normalBag: normalBag,
            additionalToken: '',
        }
    },
    mounted() {
    },
    methods: {
        addAdditionalToken() {
            if (this.additionalToken === '') {
                return;
            }

            this.chaosBag.addToken(this.additionalToken);
        },
        tokensCount() {
            return this.chaosBag.tokens().length;
        },
        additionalTokensCount() {
            return this.chaosBag.additionals().length;
        },
        randomToken() {
            randomToken(this.chaosBag.tokens())
        },
        resetBagClick() {
            this.chaosBag.resetAdditionalTokens();
        },
        bagSelectChange(event) {
            switch (event.target.value) {
                case 'easy': {
                    this.chaosBag.setStandardBag(easyBag);
                    break;
                }
                case 'normal': {
                    this.chaosBag.setStandardBag(normalBag);
                    break;
                }
                default: {
                    throw 'invalid bagSelector value';
                }
            };
        },
        availableTokensClick(event) {
            const token = event.target.getAttribute('data-name');
            if (token && token !== '') {
                this.chaosBag.addToken(token);
            }
        },
        removeTokenClick(event) {
            const token = event.target.getAttribute('data-name');
            this.chaosBag.removeToken(token);
        }
    },
    computed: {
        selectedBag() {
            switch (this.bagSelector.value) {
                case 'easy': {
                    return easyBag;
                }
                case 'normal': {
                    return normalBag;
                }
                default: {
                    throw 'invalid bagSelector value';
                }
            };
        },
    }
});

app.component('img-token', {
    props: ['name', 'percent'],
    computed: {
        tokenSrc() {
            return `assets/${this.name}.png`
        },
        percentTrim() {
            return this.percent.toFixed(2);
        }
    },
    template: `<figure class="figure">
    <img class="figure-img img-fluid rounded" v-bind:data-name="name" v-bind:src="tokenSrc">
      <figcaption class="figure-caption" v-if="percent !== undefined" style="margin-right:0.5rem;">({{ percentTrim }}%)</figcaption>
    </figure>`,
});

app.mount('#app');
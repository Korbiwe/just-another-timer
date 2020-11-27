const crypto = require('crypto');
const { PerformanceObserver, performance } = require('perf_hooks');

const TIMER_PREFIX = 'TIMER';
const MEASURE_SUFFIX = 'RESULT';
const MARK_SUFFIX = 'MARK';

// Timer names should ideally be unique
class Timer {
    constructor(name = crypto.randomBytes(16).toString('hex')) {
        this.name = name;
        this.measures = {};
        this.marks = {};
        this.observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((item) => {
                if (!item.name.includes(this.name)) return;
                const stripped_name = this._strip_prefix_suffix(item.name);
                switch (item.entryType) {
                    case 'mark':
                        this.marks[stripped_name] = true;
                        break;
                    case 'measure':
                        this.measures[stripped_name] = item.duration;
                        break;
                    default:
                        throw new Error('Something went really wrong. Received an unhandled PerformanceEntry type in PerformanceObserver of Timer.');
                }
            });
        });
        this.observer.observe({ entryTypes: ['measure', 'mark'], buffered: false });

        this.mark('start');
    }

    mark(name) {
        const mark_name = this._create_mark_name(name);
        performance.mark(mark_name);
        return this.get_mark(name);
    }

    measure(name, from_mark = 'start') {
        if (!this.marks[from_mark]) throw new Error(`Won't produce a measure for mark ${from_mark} as it wasn't created yet.`);
        const measure_name = this._create_measure_name(name);
        const start_mark_name = this._create_mark_name(from_mark);
        performance.measure(measure_name, start_mark_name);
        return this.get_measure(name);
    }

    get_mark(name) {
        return this.marks[name];
    }

    get_measure(name) {
        return this.measures[name];
    }

    _create_mark_name = (name) => {
        return [TIMER_PREFIX, this.name, name, MARK_SUFFIX].join('');
    }

    _create_measure_name = (name) => {
        return [TIMER_PREFIX, this.name, name, MEASURE_SUFFIX].join('');
    }

    _strip_prefix_suffix = (name) => {
        const regex = new RegExp([TIMER_PREFIX, MEASURE_SUFFIX, MARK_SUFFIX, this.name].join('|'),'g');
        return name.replace(regex, '');
    }
}

module.exports = Timer;


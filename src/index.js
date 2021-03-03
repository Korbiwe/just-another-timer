const getHrTime = () => {
    const nanoseconds = process.hrtime.bigint();
    return nanoseconds / BigInt(1e6);
};

// Timer names should ideally be unique
class Timer {
    constructor() {
        this.measures = {};
        this.marks = {};
        this.mark('start');
    }

    mark(name) {
        this.marks[name] = getHrTime();
        return this.get_mark(name);
    }

    measure(name, from_mark = 'start') {
        return this.get_measure(name, from_mark)
    }

    get_mark(name) {
        return this.marks[name];
    }

    get_measure(name, from_mark = 'start') {
        const mark = this.get_mark(from_mark)
        if (!mark) throw new Error(`Won't produce a measure for mark ${from_mark} as it wasn't created yet.`);

        const measure = this.measures[name];
        if (!measure) this.measures[name] = getHrTime() - mark;
        return this.measures[name];
    }
}

module.exports = Timer;


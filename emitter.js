'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let events = new Map();

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} params
         * @returns {Object}
         */
        on: function (event, context, handler, params = { times: Infinity, frequency: 1 }) {
            if (!events.has(event)) {
                events.set(event, []);
            }
            events.get(event).push({ context, handler, times: params.times,
                frequency: params.frequency, count: 0 });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            let names = [...events.keys()].filter(e => e.startsWith(`${event}.`));
            if (events.has(event)) {
                names.push(event);
            }
            for (const name of names) {
                events.set(name, events.get(name).filter(e => e.context !== context));
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            let names = getEventNamesForEmit(event);
            for (const name of names) {
                let subscriptions = events.get(name);
                if (subscriptions) {
                    subscriptions.forEach(execute);
                }
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                times = Infinity;
            }
            this.on(event, context, handler, { times, frequency: 1 });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                frequency = 1;
            }
            this.on(event, context, handler, { times: Infinity, frequency });

            return this;
        }
    };
}

function getEventNamesForEmit(event) {
    let index = event.lastIndexOf('.');
    let names = [event];
    while (index !== -1) {
        names.push(event.slice(0, index));
        index = event.lastIndexOf('.', index - 1);
    }

    return names;
}

function execute(subscription) {
    if (subscription.count >= subscription.times ||
        subscription.count % subscription.frequency !== 0) {
        subscription.count++;

        return;
    }

    subscription.handler.call(subscription.context);
    subscription.count++;
}

module.exports = {
    getEmitter,

    isStar
};


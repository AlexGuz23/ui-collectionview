import { CollectionView } from '../collectionview';
import { Observable } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';

function extend(to, _from): any {
    for (const key in _from) {
        to[key] = _from[key];
    }
    return to;
}

// Note: most of the code taken from nativescript-vue/platform/nativescript/runtime/components/list-view
// TODO: reuse code from list-view component instead of copying
const VUE_VIEW = '__vueVNodeRef__';
exports.default = {
    props: {
        items: {
            type: [Object, Array],
            validator: val => Array.isArray(val) || val instanceof ObservableArray,
            required: true
        },
        '+alias': {
            type: String,
            default: 'item'
        },
        '+index': {
            type: String
        },
        itemTemplateSelector: {
            type: Function,
            default: undefined
        }
    },
    template: `<NativeCollectionView ref="listView" :items="items" v-bind="$attrs" v-on="listeners" @itemTap="onItemTap" @itemLoading="onItemLoadingInternal"
  >
  <slot /></NativeCollectionView>`,
    // computed: {
    //   scrollDirection: function() {
    //     return this.orientation !== "vertical" ? "Horizontal" : "Vertical";
    //   }
    // },
    watch: {
        items: {
            handler(newVal, oldVal) {
                // console.log("items changed", !!newVal, !(oldVal instanceof Observable));
                if (!(oldVal instanceof Observable)) {
                    this.$refs.listView.setAttribute('items', newVal);
                    this.refresh();
                }
            },
            deep: true
        }
    },
    created() {
        // we need to remove the itemTap handler from a clone of the $listeners
        // object because we are emitting the event ourselves with added data.
        const listeners = Object.assign({}, this.$listeners);
        delete listeners.itemTap;
        this.listeners = listeners;
        this.getItemContext = getItemContext.bind(this);
    },
    mounted() {
        const listView: any & { nativeView: CollectionView } = (this.listView = this.$refs.listView);

        // listView.setAttribute('items', this.items);
        // console.log('mounted', this.$templates.getKeyedTemplates());
        listView.setAttribute('itemTemplates', this.$templates.getKeyedTemplates());
        // (listView.nativeView as CollectionView).onItemTemplatesPropertyChanged(null, templates);

        const itemTemplateSelector = this.itemTemplateSelector
            ? this.itemTemplateSelector // custom template selector if any
            : (item, index, items) => {
                const isSelected = false;
                  // const isSelected = this.listView.nativeView.isItemSelected(item);
                return this.$templates.selectorFn(this.getItemContext(item, index, isSelected));
            };
        this.listView.setAttribute('itemTemplateSelector', itemTemplateSelector);
        // this.listView.setAttribute('itemViewLoader', function (itemType) {
        //     // TODO: add other itemTypes
        //     switch (itemType) {
        //         case 'headerview':
        //             if (~availableTemplates.indexOf('header')) {
        //                 return _this.$templates.patchTemplate('header', _this.$parent);
        //             }
        //             break;
        //         case 'footerview':
        //             if (~availableTemplates.indexOf('footer')) {
        //                 return _this.$templates.patchTemplate('footer', _this.$parent);
        //             }
        //             break;
        //         case 'ItemSwipeView':
        //             if (~availableTemplates.indexOf('itemswipe')) {
        //                 return _this.$templates.patchTemplate('itemswipe', _this.$parent);
        //             }
        //             break;
        //     }
        // });
    },
    methods: {
        getItem(index) {
            return typeof this.items.getItem === 'function' ? this.items.getItem(index) : this.items[index];
        },
        onItemTap(args) {
            this.$emit('itemTap', extend({ item: this.getItem(args.index) }, args));
        },
        updateViewTemplate(args) {
            const index = args.index;
            const items = args.object.items;
            const currentItem = args.bindingContext;
            const name = args.object.itemTemplateSelector(currentItem, index, items);
            // const isSelected = this.listView.nativeView.isItemSelected(currentItem);
            const isSelected = false;
            const context = this.getItemContext(currentItem, index, isSelected);
            const oldVnode = args.view && args.view[VUE_VIEW];
            // console.log('updateViewTemplate', name, index, context['image'], context['name']);
            // console.log('updateViewTemplate context', context);
            // console.log('updateViewTemplate currentItem', currentItem);
            args.view = this.$templates.patchTemplate(name, context, oldVnode);
        },
        // onItemLoading(args) {
        //     const index = args.index;
        //     const items = args.object.items;
        //     const currentItem = typeof items.getItem === 'function' ? items.getItem(index) : items[index];
        //     const name = args.object.itemTemplateSelector(currentItem, index, items);
        //     const context = this.getItemContext(currentItem, index);
        //     const oldVnode = args.view && args.view[VUE_VIEW];
        //     args.view = this.$templates.patchTemplate(name, context, oldVnode);
        // },
        onItemLoadingInternal(args) {
            if (args.index < 0) {
                // this.updateGroupViewTemplate(args);
            } else {
                this.updateViewTemplate(args);
            }
        },
        onItemSelected(args) {
            this.updateViewTemplate(args);
        },
        onItemDeselected(args) {
            this.updateViewTemplate(args);
        },
        refresh() {
            this.listView.nativeView.refresh();
        },
        scrollToIndex(index, animate = false, snapMode = 0) {
            this.listView.nativeView.scrollToIndex(index, animate, snapMode);
        },
        getSelectedItems() {
            return this.listView.nativeView.getSelectedItems();
        }
    }
};
function getItemContext(item, index = -1, selected = false, alias = this.$props['+alias'], index_alias = this.$props['+index']) {
    return {
        [alias]: item,
        [index_alias || '$index']: index,
        $even: index % 2 === 0,
        $odd: index % 2 !== 0,
        $selected: selected
    };
}

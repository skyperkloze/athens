goog.provide('datascript.core');
goog.require('cljs.core');
goog.require('cljs.reader');
goog.require('datascript.db');
goog.require('datascript.pull_api');
goog.require('datascript.query');
goog.require('datascript.impl.entity');
datascript.core.tx0 = (536870912);
/**
 * Retrieves an entity by its id from database. Entities are lazy map-like structures to navigate DataScript database content.
 * 
 *           For `eid` pass entity id or lookup attr:
 *           
 *               (entity db 1)
 *               (entity db [:unique-attr :value])
 *          
 *           If entity does not exist, `nil` is returned:
 * 
 *               (entity db 100500) ; => nil
 * 
 *           Creating an entity by id is very cheap, almost no-op, as attr access is on-demand:
 * 
 *               (entity db 1) ; => {:db/id 1}
 * 
 *           Entity attributes can be lazily accessed through key lookups:
 *           
 *               (:attr (entity db 1)) ; => :value
 *               (get (entity db 1) :attr) ; => :value
 * 
 *           Cardinality many attributes are returned sequences:
 * 
 *               (:attrs (entity db 1)) ; => [:v1 :v2 :v3]
 * 
 *           Reference attributes are returned as another entities:
 * 
 *               (:ref (entity db 1)) ; => {:db/id 2}
 *               (:ns/ref (entity db 1)) ; => {:db/id 2}
 * 
 *           References can be walked backwards by prepending `_` to name part of an attribute:
 * 
 *               (:_ref (entity db 2)) ; => [{:db/id 1}]
 *               (:ns/_ref (entity db 2)) ; => [{:db/id 1}]
 *           
 *           Reverse reference lookup returns sequence of entities unless attribute is marked as `:db/component`:
 * 
 *               (:_component-ref (entity db 2)) ; => {:db/id 1}
 * 
 *           Entity gotchas:
 *             
 *           - Entities print as map, but are not exactly maps (they have compatible get interface though).
 *           - Entities are effectively immutable “views” into a particular version of a database.
 *           - Entities retain reference to the whole database.
 *           - You can’t change database through entities, only read.
 *           - Creating an entity by id is very cheap, almost no-op (attributes are looked up on demand).
 *           - Comparing entities just compares their ids. Be careful when comparing entities taken from differenct dbs or from different versions of the same db.
 *           - Accessed entity attributes are cached on entity itself (except backward references).
 *           - When printing, only cached attributes (the ones you have accessed before) are printed. See [[touch]].
 */
datascript.core.entity = datascript.impl.entity.entity;
/**
 * Given lookup ref `[unique-attr value]`, returns numberic entity id.
 * 
 *           If entity does not exist, returns `nil`.
 * 
 *           For numeric `eid` returns `eid` itself (does not check for entity existence in that case).
 */
datascript.core.entid = datascript.db.entid;
/**
 * Returns a db that entity was created from.
 */
datascript.core.entity_db = (function datascript$core$entity_db(entity){
if(datascript.impl.entity.entity_QMARK_(entity)){
} else {
throw (new Error("Assert failed: (de/entity? entity)"));
}

return entity.db;
});
/**
 * Forces all entity attributes to be eagerly fetched and cached. Only usable for debug output.
 * 
 *           Usage:
 * 
 *           ```
 *           (entity db 1) ; => {:db/id 1}
 *           (touch (entity db 1)) ; => {:db/id 1, :dislikes [:pie], :likes [:pizza]}
 *           ```
 */
datascript.core.touch = datascript.impl.entity.touch;
/**
 * Fetches data from database using recursive declarative description. See [docs.datomic.com/on-prem/pull.html](https://docs.datomic.com/on-prem/pull.html).
 * 
 *           Unlike [[entity]], returns plain Clojure map (not lazy).
 * 
 *           Usage:
 * 
 *               (pull db [:db/id, :name, :likes, {:friends [:db/id :name]}] 1)
 *               ; => {:db/id   1,
 *               ;     :name    "Ivan"
 *               ;     :likes   [:pizza]
 *               ;     :friends [{:db/id 2, :name "Oleg"}]
 */
datascript.core.pull = datascript.pull_api.pull;
/**
 * Same as [[pull]], but accepts sequence of ids and returns sequence of maps.
 * 
 *           Usage:
 * 
 *           ```
 *           (pull-many db [:db/id :name] [1 2])
 *           ; => [{:db/id 1, :name "Ivan"}
 *           ;     {:db/id 2, :name "Oleg"}]
 *           ```
 */
datascript.core.pull_many = datascript.pull_api.pull_many;
/**
 * Executes a datalog query. See [docs.datomic.com/on-prem/query.html](https://docs.datomic.com/on-prem/query.html).
 * 
 *        Usage:
 *        
 *        ```
 *        (q '[:find ?value
 *             :where [_ :likes ?value]]
 *           db)
 *        ; => #{["fries"] ["candy"] ["pie"] ["pizza"]}
 *        ```
 */
datascript.core.q = datascript.query.q;
/**
 * Creates an empty database with an optional schema.
 * 
 *           Usage:
 *           
 *           ```
 *           (empty-db) ; => #datascript/DB {:schema {}, :datoms []}
 *   
 *           (empty-db {:likes {:db/cardinality :db.cardinality/many}})
 *           ; => #datascript/DB {:schema {:likes {:db/cardinality :db.cardinality/many}}
 *           ;                    :datoms []}
 *           ```
 */
datascript.core.empty_db = datascript.db.empty_db;
/**
 * Returns `true` if the given value is an immutable database, `false` otherwise.
 */
datascript.core.db_QMARK_ = datascript.db.db_QMARK_;
/**
 * Low-level fn to create raw datoms.
 * 
 *           Optionally with transaction id (number) and `added` flag (`true` for addition, `false` for retraction).
 * 
 *           See also [[init-db]].
 */
datascript.core.datom = datascript.db.datom;
/**
 * Returns `true` if the given value is a datom, `false` otherwise.
 */
datascript.core.datom_QMARK_ = datascript.db.datom_QMARK_;
/**
 * Low-level fn for creating database quickly from a trusted sequence of datoms.
 * 
 *           Does no validation on inputs, so `datoms` must be well-formed and match schema.
 * 
 *           Used internally in db (de)serialization. See also [[datom]].
 */
datascript.core.init_db = datascript.db.init_db;
/**
 * Returns `true` if this database was filtered using [[filter]], `false` otherwise.
 */
datascript.core.is_filtered = (function datascript$core$is_filtered(x){
return (x instanceof datascript.db.FilteredDB);
});
/**
 * Returns a view over database that has same interface but only includes datoms for which the `(pred db datom)` is true. Can be applied multiple times.
 * 
 * Filtered DB gotchas:
 * 
 * - All operations on filtered database are proxied to original DB, then filter pred is applied.
 * - Not cached. You pay filter penalty every time.
 * - Supports entities, pull, queries, index access.
 * - Does not support [[with]] and [[db-with]].
 */
datascript.core.filter = (function datascript$core$filter(db,pred){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

if(datascript.core.is_filtered(db)){
var fdb = db;
var orig_pred = fdb.pred;
var orig_db = fdb.unfiltered_db;
return (new datascript.db.FilteredDB(orig_db,(function (p1__45161_SHARP_){
var and__4174__auto__ = (orig_pred.cljs$core$IFn$_invoke$arity$1 ? orig_pred.cljs$core$IFn$_invoke$arity$1(p1__45161_SHARP_) : orig_pred.call(null,p1__45161_SHARP_));
if(cljs.core.truth_(and__4174__auto__)){
return (pred.cljs$core$IFn$_invoke$arity$2 ? pred.cljs$core$IFn$_invoke$arity$2(orig_db,p1__45161_SHARP_) : pred.call(null,orig_db,p1__45161_SHARP_));
} else {
return and__4174__auto__;
}
}),cljs.core.atom.cljs$core$IFn$_invoke$arity$1((0)),null,null,null));
} else {
return (new datascript.db.FilteredDB(db,(function (p1__45162_SHARP_){
return (pred.cljs$core$IFn$_invoke$arity$2 ? pred.cljs$core$IFn$_invoke$arity$2(db,p1__45162_SHARP_) : pred.call(null,db,p1__45162_SHARP_));
}),cljs.core.atom.cljs$core$IFn$_invoke$arity$1((0)),null,null,null));
}
});
/**
 * Same as [[transact!]], but applies to an immutable database value. Returns transaction report (see [[transact!]]).
 */
datascript.core.with$ = (function datascript$core$with(var_args){
var G__45164 = arguments.length;
switch (G__45164) {
case 2:
return datascript.core.with$.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.with$.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.with$.cljs$core$IFn$_invoke$arity$2 = (function (db,tx_data){
return datascript.core.with$.cljs$core$IFn$_invoke$arity$3(db,tx_data,null);
}));

(datascript.core.with$.cljs$core$IFn$_invoke$arity$3 = (function (db,tx_data,tx_meta){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

if(datascript.core.is_filtered(db)){
throw cljs.core.ex_info.cljs$core$IFn$_invoke$arity$2("Filtered DB cannot be modified",new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"error","error",-978969032),new cljs.core.Keyword("transaction","filtered","transaction/filtered",1699706605)], null));
} else {
return datascript.db.transact_tx_data(datascript.db.map__GT_TxReport(new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"db-before","db-before",-553691536),db,new cljs.core.Keyword(null,"db-after","db-after",-571884666),db,new cljs.core.Keyword(null,"tx-data","tx-data",934159761),cljs.core.PersistentVector.EMPTY,new cljs.core.Keyword(null,"tempids","tempids",1767509089),cljs.core.PersistentArrayMap.EMPTY,new cljs.core.Keyword(null,"tx-meta","tx-meta",1159283194),tx_meta], null)),tx_data);
}
}));

(datascript.core.with$.cljs$lang$maxFixedArity = 3);

/**
 * Applies transaction to an immutable db value, returning new immutable db value. Same as `(:db-after (with db tx-data))`.
 */
datascript.core.db_with = (function datascript$core$db_with(db,tx_data){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return new cljs.core.Keyword(null,"db-after","db-after",-571884666).cljs$core$IFn$_invoke$arity$1(datascript.core.with$.cljs$core$IFn$_invoke$arity$2(db,tx_data));
});
/**
 * Index lookup. Returns a sequence of datoms (lazy iterator over actual DB index) which components (e, a, v) match passed arguments.
 * 
 * Datoms are sorted in index sort order. Possible `index` values are: `:eavt`, `:aevt`, `:avet`.
 * 
 * Usage:
 * 
 *     ; find all datoms for entity id == 1 (any attrs and values)
 *     ; sort by attribute, then value
 *     (datoms db :eavt 1)
 *     ; => (#datascript/Datom [1 :friends 2]
 *     ;     #datascript/Datom [1 :likes "fries"]
 *     ;     #datascript/Datom [1 :likes "pizza"]
 *     ;     #datascript/Datom [1 :name "Ivan"])
 *   
 *     ; find all datoms for entity id == 1 and attribute == :likes (any values)
 *     ; sorted by value
 *     (datoms db :eavt 1 :likes)
 *     ; => (#datascript/Datom [1 :likes "fries"]
 *     ;     #datascript/Datom [1 :likes "pizza"])
 *     
 *     ; find all datoms for entity id == 1, attribute == :likes and value == "pizza"
 *     (datoms db :eavt 1 :likes "pizza")
 *     ; => (#datascript/Datom [1 :likes "pizza"])
 *   
 *     ; find all datoms for attribute == :likes (any entity ids and values)
 *     ; sorted by entity id, then value
 *     (datoms db :aevt :likes)
 *     ; => (#datascript/Datom [1 :likes "fries"]
 *     ;     #datascript/Datom [1 :likes "pizza"]
 *     ;     #datascript/Datom [2 :likes "candy"]
 *     ;     #datascript/Datom [2 :likes "pie"]
 *     ;     #datascript/Datom [2 :likes "pizza"])
 *   
 *     ; find all datoms that have attribute == `:likes` and value == `"pizza"` (any entity id)
 *     ; `:likes` must be a unique attr, reference or marked as `:db/index true`
 *     (datoms db :avet :likes "pizza")
 *     ; => (#datascript/Datom [1 :likes "pizza"]
 *     ;     #datascript/Datom [2 :likes "pizza"])
 *   
 *     ; find all datoms sorted by entity id, then attribute, then value
 *     (datoms db :eavt) ; => (...)
 * 
 * Useful patterns:
 * 
 *     ; get all values of :db.cardinality/many attribute
 *     (->> (datoms db :eavt eid attr) (map :v))
 *   
 *     ; lookup entity ids by attribute value
 *     (->> (datoms db :avet attr value) (map :e))
 *   
 *     ; find all entities with a specific attribute
 *     (->> (datoms db :aevt attr) (map :e))
 *   
 *     ; find “singleton” entity by its attr
 *     (->> (datoms db :aevt attr) first :e)
 *   
 *     ; find N entities with lowest attr value (e.g. 10 earliest posts)
 *     (->> (datoms db :avet attr) (take N))
 *   
 *     ; find N entities with highest attr value (e.g. 10 latest posts)
 *     (->> (datoms db :avet attr) (reverse) (take N))
 * 
 * Gotchas:
 * 
 * - Index lookup is usually more efficient than doing a query with a single clause.
 * - Resulting iterator is calculated in constant time and small constant memory overhead.
 * - Iterator supports efficient `first`, `next`, `reverse`, `seq` and is itself a sequence.
 * - Will not return datoms that are not part of the index (e.g. attributes with no `:db/index` in schema when querying `:avet` index).
 *   - `:eavt` and `:aevt` contain all datoms.
 *   - `:avet` only contains datoms for references, `:db/unique` and `:db/index` attributes.
 */
datascript.core.datoms = (function datascript$core$datoms(var_args){
var G__45166 = arguments.length;
switch (G__45166) {
case 2:
return datascript.core.datoms.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.datoms.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 4:
return datascript.core.datoms.cljs$core$IFn$_invoke$arity$4((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]));

break;
case 5:
return datascript.core.datoms.cljs$core$IFn$_invoke$arity$5((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]));

break;
case 6:
return datascript.core.datoms.cljs$core$IFn$_invoke$arity$6((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]),(arguments[(5)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.datoms.cljs$core$IFn$_invoke$arity$2 = (function (db,index){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._datoms(db,index,cljs.core.PersistentVector.EMPTY);
}));

(datascript.core.datoms.cljs$core$IFn$_invoke$arity$3 = (function (db,index,c1){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._datoms(db,index,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1], null));
}));

(datascript.core.datoms.cljs$core$IFn$_invoke$arity$4 = (function (db,index,c1,c2){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._datoms(db,index,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2], null));
}));

(datascript.core.datoms.cljs$core$IFn$_invoke$arity$5 = (function (db,index,c1,c2,c3){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._datoms(db,index,new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2,c3], null));
}));

(datascript.core.datoms.cljs$core$IFn$_invoke$arity$6 = (function (db,index,c1,c2,c3,c4){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._datoms(db,index,new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2,c3,c4], null));
}));

(datascript.core.datoms.cljs$lang$maxFixedArity = 6);

/**
 * Similar to [[datoms]], but will return datoms starting from specified components and including rest of the database until the end of the index.
 * 
 * If no datom matches passed arguments exactly, iterator will start from first datom that could be considered “greater” in index order.
 * 
 * Usage:
 * 
 *     (seek-datoms db :eavt 1)
 *     ; => (#datascript/Datom [1 :friends 2]
 *     ;     #datascript/Datom [1 :likes "fries"]
 *     ;     #datascript/Datom [1 :likes "pizza"]
 *     ;     #datascript/Datom [1 :name "Ivan"]
 *     ;     #datascript/Datom [2 :likes "candy"]
 *     ;     #datascript/Datom [2 :likes "pie"]
 *     ;     #datascript/Datom [2 :likes "pizza"])
 * 
 *     (seek-datoms db :eavt 1 :name)
 *     ; => (#datascript/Datom [1 :name "Ivan"]
 *     ;     #datascript/Datom [2 :likes "candy"]
 *     ;     #datascript/Datom [2 :likes "pie"]
 *     ;     #datascript/Datom [2 :likes "pizza"])
 *   
 *     (seek-datoms db :eavt 2) 
 *     ; => (#datascript/Datom [2 :likes "candy"]
 *     ;     #datascript/Datom [2 :likes "pie"]
 *     ;     #datascript/Datom [2 :likes "pizza"])
 *   
 *     ; no datom [2 :likes "fish"], so starts with one immediately following such in index
 *     (seek-datoms db :eavt 2 :likes "fish")
 *     ; => (#datascript/Datom [2 :likes "pie"]
 *     ;     #datascript/Datom [2 :likes "pizza"])
 */
datascript.core.seek_datoms = (function datascript$core$seek_datoms(var_args){
var G__45168 = arguments.length;
switch (G__45168) {
case 2:
return datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 4:
return datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$4((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]));

break;
case 5:
return datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$5((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]));

break;
case 6:
return datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$6((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]),(arguments[(5)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$2 = (function (db,index){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._seek_datoms(db,index,cljs.core.PersistentVector.EMPTY);
}));

(datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$3 = (function (db,index,c1){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._seek_datoms(db,index,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1], null));
}));

(datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$4 = (function (db,index,c1,c2){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._seek_datoms(db,index,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2], null));
}));

(datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$5 = (function (db,index,c1,c2,c3){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._seek_datoms(db,index,new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2,c3], null));
}));

(datascript.core.seek_datoms.cljs$core$IFn$_invoke$arity$6 = (function (db,index,c1,c2,c3,c4){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._seek_datoms(db,index,new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2,c3,c4], null));
}));

(datascript.core.seek_datoms.cljs$lang$maxFixedArity = 6);

/**
 * Same as [[seek-datoms]], but goes backwards until the beginning of the index.
 */
datascript.core.rseek_datoms = (function datascript$core$rseek_datoms(var_args){
var G__45170 = arguments.length;
switch (G__45170) {
case 2:
return datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
case 4:
return datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$4((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]));

break;
case 5:
return datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$5((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]));

break;
case 6:
return datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$6((arguments[(0)]),(arguments[(1)]),(arguments[(2)]),(arguments[(3)]),(arguments[(4)]),(arguments[(5)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$2 = (function (db,index){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._rseek_datoms(db,index,cljs.core.PersistentVector.EMPTY);
}));

(datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$3 = (function (db,index,c1){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._rseek_datoms(db,index,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1], null));
}));

(datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$4 = (function (db,index,c1,c2){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._rseek_datoms(db,index,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2], null));
}));

(datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$5 = (function (db,index,c1,c2,c3){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._rseek_datoms(db,index,new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2,c3], null));
}));

(datascript.core.rseek_datoms.cljs$core$IFn$_invoke$arity$6 = (function (db,index,c1,c2,c3,c4){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._rseek_datoms(db,index,new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [c1,c2,c3,c4], null));
}));

(datascript.core.rseek_datoms.cljs$lang$maxFixedArity = 6);

/**
 * Returns part of `:avet` index between `[_ attr start]` and `[_ attr end]` in AVET sort order.
 *   
 * Same properties as [[datoms]].
 * 
 * `attr` must be a reference, unique attribute or marked as `:db/index true`.
 * 
 * Usage:
 * 
 *     (index-range db :likes "a" "zzzzzzzzz")
 *     ; => (#datascript/Datom [2 :likes "candy"]
 *     ;     #datascript/Datom [1 :likes "fries"]
 *     ;     #datascript/Datom [2 :likes "pie"]
 *     ;     #datascript/Datom [1 :likes "pizza"]
 *     ;     #datascript/Datom [2 :likes "pizza"])
 *      
 *     (index-range db :likes "egg" "pineapple")
 *     ; => (#datascript/Datom [1 :likes "fries"]
 *     ;     #datascript/Datom [2 :likes "pie"])
 *         
 * Useful patterns:
 *   
 *     ; find all entities with age in a specific range (inclusive)
 *     (->> (index-range db :age 18 60) (map :e))
 */
datascript.core.index_range = (function datascript$core$index_range(db,attr,start,end){
if(datascript.db.db_QMARK_(db)){
} else {
throw (new Error("Assert failed: (db/db? db)"));
}

return datascript.db._index_range(db,attr,start,end);
});
/**
 * Returns `true` if this is a connection to a DataScript db, `false` otherwise.
 */
datascript.core.conn_QMARK_ = (function datascript$core$conn_QMARK_(conn){
if((((!((conn == null))))?(((((conn.cljs$lang$protocol_mask$partition0$ & (32768))) || ((cljs.core.PROTOCOL_SENTINEL === conn.cljs$core$IDeref$))))?true:(((!conn.cljs$lang$protocol_mask$partition0$))?cljs.core.native_satisfies_QMARK_(cljs.core.IDeref,conn):false)):cljs.core.native_satisfies_QMARK_(cljs.core.IDeref,conn))){
return datascript.db.db_QMARK_(cljs.core.deref(conn));
} else {
return false;
}
});
/**
 * Creates a mutable reference to a given immutable database. See [[create-conn]].
 */
datascript.core.conn_from_db = (function datascript$core$conn_from_db(db){
return cljs.core.atom.cljs$core$IFn$_invoke$arity$variadic(db,cljs.core.prim_seq.cljs$core$IFn$_invoke$arity$2([new cljs.core.Keyword(null,"meta","meta",1499536964),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"listeners","listeners",394544445),cljs.core.atom.cljs$core$IFn$_invoke$arity$1(cljs.core.PersistentArrayMap.EMPTY)], null)], 0));
});
/**
 * Creates an empty DB and a mutable reference to it. See [[create-conn]].
 */
datascript.core.conn_from_datoms = (function datascript$core$conn_from_datoms(var_args){
var G__45175 = arguments.length;
switch (G__45175) {
case 1:
return datascript.core.conn_from_datoms.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return datascript.core.conn_from_datoms.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.conn_from_datoms.cljs$core$IFn$_invoke$arity$1 = (function (datoms){
return datascript.core.conn_from_db((datascript.core.init_db.cljs$core$IFn$_invoke$arity$1 ? datascript.core.init_db.cljs$core$IFn$_invoke$arity$1(datoms) : datascript.core.init_db.call(null,datoms)));
}));

(datascript.core.conn_from_datoms.cljs$core$IFn$_invoke$arity$2 = (function (datoms,schema){
return datascript.core.conn_from_db((datascript.core.init_db.cljs$core$IFn$_invoke$arity$2 ? datascript.core.init_db.cljs$core$IFn$_invoke$arity$2(datoms,schema) : datascript.core.init_db.call(null,datoms,schema)));
}));

(datascript.core.conn_from_datoms.cljs$lang$maxFixedArity = 2);

/**
 * Creates a mutable reference (a “connection”) to an empty immutable database.
 * 
 * Connections are lightweight in-memory structures (~atoms) with direct support of transaction listeners ([[listen!]], [[unlisten!]]) and other handy DataScript APIs ([[transact!]], [[reset-conn!]], [[db]]).
 * 
 * To access underlying immutable DB value, deref: `@conn`.
 */
datascript.core.create_conn = (function datascript$core$create_conn(var_args){
var G__45177 = arguments.length;
switch (G__45177) {
case 0:
return datascript.core.create_conn.cljs$core$IFn$_invoke$arity$0();

break;
case 1:
return datascript.core.create_conn.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.create_conn.cljs$core$IFn$_invoke$arity$0 = (function (){
return datascript.core.conn_from_db((datascript.core.empty_db.cljs$core$IFn$_invoke$arity$0 ? datascript.core.empty_db.cljs$core$IFn$_invoke$arity$0() : datascript.core.empty_db.call(null)));
}));

(datascript.core.create_conn.cljs$core$IFn$_invoke$arity$1 = (function (schema){
return datascript.core.conn_from_db((datascript.core.empty_db.cljs$core$IFn$_invoke$arity$1 ? datascript.core.empty_db.cljs$core$IFn$_invoke$arity$1(schema) : datascript.core.empty_db.call(null,schema)));
}));

(datascript.core.create_conn.cljs$lang$maxFixedArity = 1);

datascript.core._transact_BANG_ = (function datascript$core$_transact_BANG_(conn,tx_data,tx_meta){
if(datascript.core.conn_QMARK_(conn)){
} else {
throw (new Error("Assert failed: (conn? conn)"));
}

var report = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(null);
cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$2(conn,(function (db){
var r = datascript.core.with$.cljs$core$IFn$_invoke$arity$3(db,tx_data,tx_meta);
cljs.core.reset_BANG_(report,r);

return new cljs.core.Keyword(null,"db-after","db-after",-571884666).cljs$core$IFn$_invoke$arity$1(r);
}));

return cljs.core.deref(report);
});
/**
 * Applies transaction the underlying database value and atomically updates connection reference to point to the result of that transaction, new db value.
 *   
 * Returns transaction report, a map:
 * 
 *     { :db-before ...       ; db value before transaction
 *       :db-after  ...       ; db value after transaction
 *       :tx-data   [...]     ; plain datoms that were added/retracted from db-before
 *       :tempids   {...}     ; map of tempid from tx-data => assigned entid in db-after
 *       :tx-meta   tx-meta } ; the exact value you passed as `tx-meta`
 * 
 *   Note! `conn` will be updated in-place and is not returned from [[transact!]].
 *   
 *   Usage:
 * 
 *    ; add a single datom to an existing entity (1)
 *    (transact! conn [[:db/add 1 :name "Ivan"]])
 *   
 *    ; retract a single datom
 *    (transact! conn [[:db/retract 1 :name "Ivan"]])
 *   
 *    ; retract single entity attribute
 *    (transact! conn [[:db.fn/retractAttribute 1 :name]])
 *   
 *    ; ... or equivalently (since Datomic changed its API to support this):
 *    (transact! conn [[:db/retract 1 :name]])
 *    
 *    ; retract all entity attributes (effectively deletes entity)
 *    (transact! conn [[:db.fn/retractEntity 1]])
 *   
 *    ; create a new entity (`-1`, as any other negative value, is a tempid
 *    ; that will be replaced with DataScript to a next unused eid)
 *    (transact! conn [[:db/add -1 :name "Ivan"]])
 *   
 *    ; check assigned id (here `*1` is a result returned from previous `transact!` call)
 *    (def report *1)
 *    (:tempids report) ; => {-1 296}
 *   
 *    ; check actual datoms inserted
 *    (:tx-data report) ; => [#datascript/Datom [296 :name "Ivan"]]
 *   
 *    ; tempid can also be a string
 *    (transact! conn [[:db/add "ivan" :name "Ivan"]])
 *    (:tempids *1) ; => {"ivan" 297}
 *   
 *    ; reference another entity (must exist)
 *    (transact! conn [[:db/add -1 :friend 296]])
 *   
 *    ; create an entity and set multiple attributes (in a single transaction
 *    ; equal tempids will be replaced with the same unused yet entid)
 *    (transact! conn [[:db/add -1 :name "Ivan"]
 *                     [:db/add -1 :likes "fries"]
 *                     [:db/add -1 :likes "pizza"]
 *                     [:db/add -1 :friend 296]])
 *   
 *    ; create an entity and set multiple attributes (alternative map form)
 *    (transact! conn [{:db/id  -1
 *                      :name   "Ivan"
 *                      :likes  ["fries" "pizza"]
 *                      :friend 296}])
 *    
 *    ; update an entity (alternative map form). Can’t retract attributes in
 *    ; map form. For cardinality many attrs, value (fish in this example)
 *    ; will be added to the list of existing values
 *    (transact! conn [{:db/id  296
 *                      :name   "Oleg"
 *                      :likes  ["fish"]}])
 * 
 *    ; ref attributes can be specified as nested map, that will create netsed entity as well
 *    (transact! conn [{:db/id  -1
 *                      :name   "Oleg"
 *                      :friend {:db/id -2
 *                               :name "Sergey"}])
 *                               
 *    ; reverse attribute name can be used if you want created entity to become
 *    ; a value in another entity reference
 *    (transact! conn [{:db/id  -1
 *                      :name   "Oleg"
 *                      :_friend 296}])
 *    ; equivalent to
 *    (transact! conn [{:db/id  -1, :name   "Oleg"}
 *                     {:db/id 296, :friend -1}])
 *    ; equivalent to
 *    (transact! conn [[:db/add  -1 :name   "Oleg"]
 *                     {:db/add 296 :friend -1]])
 */
datascript.core.transact_BANG_ = (function datascript$core$transact_BANG_(var_args){
var G__45179 = arguments.length;
switch (G__45179) {
case 2:
return datascript.core.transact_BANG_.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.transact_BANG_.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.transact_BANG_.cljs$core$IFn$_invoke$arity$2 = (function (conn,tx_data){
return datascript.core.transact_BANG_.cljs$core$IFn$_invoke$arity$3(conn,tx_data,null);
}));

(datascript.core.transact_BANG_.cljs$core$IFn$_invoke$arity$3 = (function (conn,tx_data,tx_meta){
if(datascript.core.conn_QMARK_(conn)){
} else {
throw (new Error("Assert failed: (conn? conn)"));
}

var report = datascript.core._transact_BANG_(conn,tx_data,tx_meta);
var seq__45183_45335 = cljs.core.seq((function (){var G__45194 = new cljs.core.Keyword(null,"listeners","listeners",394544445).cljs$core$IFn$_invoke$arity$1(cljs.core.meta(conn));
if((G__45194 == null)){
return null;
} else {
return cljs.core.deref(G__45194);
}
})());
var chunk__45184_45336 = null;
var count__45185_45337 = (0);
var i__45186_45338 = (0);
while(true){
if((i__45186_45338 < count__45185_45337)){
var vec__45195_45341 = chunk__45184_45336.cljs$core$IIndexed$_nth$arity$2(null,i__45186_45338);
var __45342 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45195_45341,(0),null);
var callback_45343 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45195_45341,(1),null);
(callback_45343.cljs$core$IFn$_invoke$arity$1 ? callback_45343.cljs$core$IFn$_invoke$arity$1(report) : callback_45343.call(null,report));


var G__45345 = seq__45183_45335;
var G__45346 = chunk__45184_45336;
var G__45347 = count__45185_45337;
var G__45348 = (i__45186_45338 + (1));
seq__45183_45335 = G__45345;
chunk__45184_45336 = G__45346;
count__45185_45337 = G__45347;
i__45186_45338 = G__45348;
continue;
} else {
var temp__5735__auto___45349 = cljs.core.seq(seq__45183_45335);
if(temp__5735__auto___45349){
var seq__45183_45350__$1 = temp__5735__auto___45349;
if(cljs.core.chunked_seq_QMARK_(seq__45183_45350__$1)){
var c__4609__auto___45352 = cljs.core.chunk_first(seq__45183_45350__$1);
var G__45353 = cljs.core.chunk_rest(seq__45183_45350__$1);
var G__45354 = c__4609__auto___45352;
var G__45355 = cljs.core.count(c__4609__auto___45352);
var G__45356 = (0);
seq__45183_45335 = G__45353;
chunk__45184_45336 = G__45354;
count__45185_45337 = G__45355;
i__45186_45338 = G__45356;
continue;
} else {
var vec__45198_45357 = cljs.core.first(seq__45183_45350__$1);
var __45358 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45198_45357,(0),null);
var callback_45359 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45198_45357,(1),null);
(callback_45359.cljs$core$IFn$_invoke$arity$1 ? callback_45359.cljs$core$IFn$_invoke$arity$1(report) : callback_45359.call(null,report));


var G__45360 = cljs.core.next(seq__45183_45350__$1);
var G__45361 = null;
var G__45362 = (0);
var G__45363 = (0);
seq__45183_45335 = G__45360;
chunk__45184_45336 = G__45361;
count__45185_45337 = G__45362;
i__45186_45338 = G__45363;
continue;
}
} else {
}
}
break;
}

return report;
}));

(datascript.core.transact_BANG_.cljs$lang$maxFixedArity = 3);

/**
 * Forces underlying `conn` value to become `db`. Will generate a tx-report that will remove everything from old value and insert everything from the new one.
 */
datascript.core.reset_conn_BANG_ = (function datascript$core$reset_conn_BANG_(var_args){
var G__45203 = arguments.length;
switch (G__45203) {
case 2:
return datascript.core.reset_conn_BANG_.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.reset_conn_BANG_.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.reset_conn_BANG_.cljs$core$IFn$_invoke$arity$2 = (function (conn,db){
return datascript.core.reset_conn_BANG_.cljs$core$IFn$_invoke$arity$3(conn,db,null);
}));

(datascript.core.reset_conn_BANG_.cljs$core$IFn$_invoke$arity$3 = (function (conn,db,tx_meta){
var report = datascript.db.map__GT_TxReport(new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"db-before","db-before",-553691536),cljs.core.deref(conn),new cljs.core.Keyword(null,"db-after","db-after",-571884666),db,new cljs.core.Keyword(null,"tx-data","tx-data",934159761),cljs.core.concat.cljs$core$IFn$_invoke$arity$2(cljs.core.map.cljs$core$IFn$_invoke$arity$2((function (p1__45201_SHARP_){
return cljs.core.assoc.cljs$core$IFn$_invoke$arity$3(p1__45201_SHARP_,new cljs.core.Keyword(null,"added","added",2057651688),false);
}),datascript.core.datoms.cljs$core$IFn$_invoke$arity$2(cljs.core.deref(conn),new cljs.core.Keyword(null,"eavt","eavt",-666437073))),datascript.core.datoms.cljs$core$IFn$_invoke$arity$2(db,new cljs.core.Keyword(null,"eavt","eavt",-666437073))),new cljs.core.Keyword(null,"tx-meta","tx-meta",1159283194),tx_meta], null));
cljs.core.reset_BANG_(conn,db);

var seq__45204_45365 = cljs.core.seq((function (){var G__45215 = new cljs.core.Keyword(null,"listeners","listeners",394544445).cljs$core$IFn$_invoke$arity$1(cljs.core.meta(conn));
if((G__45215 == null)){
return null;
} else {
return cljs.core.deref(G__45215);
}
})());
var chunk__45205_45366 = null;
var count__45206_45367 = (0);
var i__45207_45368 = (0);
while(true){
if((i__45207_45368 < count__45206_45367)){
var vec__45216_45369 = chunk__45205_45366.cljs$core$IIndexed$_nth$arity$2(null,i__45207_45368);
var __45370 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45216_45369,(0),null);
var callback_45371 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45216_45369,(1),null);
(callback_45371.cljs$core$IFn$_invoke$arity$1 ? callback_45371.cljs$core$IFn$_invoke$arity$1(report) : callback_45371.call(null,report));


var G__45372 = seq__45204_45365;
var G__45373 = chunk__45205_45366;
var G__45374 = count__45206_45367;
var G__45375 = (i__45207_45368 + (1));
seq__45204_45365 = G__45372;
chunk__45205_45366 = G__45373;
count__45206_45367 = G__45374;
i__45207_45368 = G__45375;
continue;
} else {
var temp__5735__auto___45376 = cljs.core.seq(seq__45204_45365);
if(temp__5735__auto___45376){
var seq__45204_45377__$1 = temp__5735__auto___45376;
if(cljs.core.chunked_seq_QMARK_(seq__45204_45377__$1)){
var c__4609__auto___45378 = cljs.core.chunk_first(seq__45204_45377__$1);
var G__45379 = cljs.core.chunk_rest(seq__45204_45377__$1);
var G__45380 = c__4609__auto___45378;
var G__45381 = cljs.core.count(c__4609__auto___45378);
var G__45382 = (0);
seq__45204_45365 = G__45379;
chunk__45205_45366 = G__45380;
count__45206_45367 = G__45381;
i__45207_45368 = G__45382;
continue;
} else {
var vec__45219_45383 = cljs.core.first(seq__45204_45377__$1);
var __45384 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45219_45383,(0),null);
var callback_45385 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45219_45383,(1),null);
(callback_45385.cljs$core$IFn$_invoke$arity$1 ? callback_45385.cljs$core$IFn$_invoke$arity$1(report) : callback_45385.call(null,report));


var G__45386 = cljs.core.next(seq__45204_45377__$1);
var G__45387 = null;
var G__45388 = (0);
var G__45389 = (0);
seq__45204_45365 = G__45386;
chunk__45205_45366 = G__45387;
count__45206_45367 = G__45388;
i__45207_45368 = G__45389;
continue;
}
} else {
}
}
break;
}

return db;
}));

(datascript.core.reset_conn_BANG_.cljs$lang$maxFixedArity = 3);

datascript.core.atom_QMARK_ = (function datascript$core$atom_QMARK_(a){
return (a instanceof cljs.core.Atom);
});
/**
 * Listen for changes on the given connection. Whenever a transaction is applied to the database via [[transact!]], the callback is called
 * with the transaction report. `key` is any opaque unique value.
 * 
 * Idempotent. Calling [[listen!]] with the same key twice will override old callback with the new value.
 * 
 * Returns the key under which this listener is registered. See also [[unlisten!]].
 */
datascript.core.listen_BANG_ = (function datascript$core$listen_BANG_(var_args){
var G__45228 = arguments.length;
switch (G__45228) {
case 2:
return datascript.core.listen_BANG_.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.listen_BANG_.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.listen_BANG_.cljs$core$IFn$_invoke$arity$2 = (function (conn,callback){
return datascript.core.listen_BANG_.cljs$core$IFn$_invoke$arity$3(conn,cljs.core.rand.cljs$core$IFn$_invoke$arity$0(),callback);
}));

(datascript.core.listen_BANG_.cljs$core$IFn$_invoke$arity$3 = (function (conn,key,callback){
if(datascript.core.conn_QMARK_(conn)){
} else {
throw (new Error("Assert failed: (conn? conn)"));
}

if(datascript.core.atom_QMARK_(new cljs.core.Keyword(null,"listeners","listeners",394544445).cljs$core$IFn$_invoke$arity$1(cljs.core.meta(conn)))){
} else {
throw (new Error("Assert failed: (atom? (:listeners (meta conn)))"));
}

cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$4(new cljs.core.Keyword(null,"listeners","listeners",394544445).cljs$core$IFn$_invoke$arity$1(cljs.core.meta(conn)),cljs.core.assoc,key,callback);

return key;
}));

(datascript.core.listen_BANG_.cljs$lang$maxFixedArity = 3);

/**
 * Removes registered listener from connection. See also [[listen!]].
 */
datascript.core.unlisten_BANG_ = (function datascript$core$unlisten_BANG_(conn,key){
if(datascript.core.conn_QMARK_(conn)){
} else {
throw (new Error("Assert failed: (conn? conn)"));
}

if(datascript.core.atom_QMARK_(new cljs.core.Keyword(null,"listeners","listeners",394544445).cljs$core$IFn$_invoke$arity$1(cljs.core.meta(conn)))){
} else {
throw (new Error("Assert failed: (atom? (:listeners (meta conn)))"));
}

return cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$3(new cljs.core.Keyword(null,"listeners","listeners",394544445).cljs$core$IFn$_invoke$arity$1(cljs.core.meta(conn)),cljs.core.dissoc,key);
});
/**
 * Data readers for EDN readers. In CLJS they’re registered automatically. In CLJ, if `data_readers.clj` do not work, you can always do
 * 
 *           ```
 *           (clojure.edn/read-string {:readers data-readers} "...")
 *           ```
 */
datascript.core.data_readers = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Symbol("datascript","Datom","datascript/Datom",-901340080,null),datascript.db.datom_from_reader,new cljs.core.Symbol("datascript","DB","datascript/DB",-487332776,null),datascript.db.db_from_reader], null);
var seq__45235_45391 = cljs.core.seq(datascript.core.data_readers);
var chunk__45236_45392 = null;
var count__45237_45393 = (0);
var i__45238_45394 = (0);
while(true){
if((i__45238_45394 < count__45237_45393)){
var vec__45245_45395 = chunk__45236_45392.cljs$core$IIndexed$_nth$arity$2(null,i__45238_45394);
var tag_45396 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45245_45395,(0),null);
var cb_45397 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45245_45395,(1),null);
cljs.reader.register_tag_parser_BANG_(tag_45396,cb_45397);


var G__45398 = seq__45235_45391;
var G__45399 = chunk__45236_45392;
var G__45400 = count__45237_45393;
var G__45401 = (i__45238_45394 + (1));
seq__45235_45391 = G__45398;
chunk__45236_45392 = G__45399;
count__45237_45393 = G__45400;
i__45238_45394 = G__45401;
continue;
} else {
var temp__5735__auto___45402 = cljs.core.seq(seq__45235_45391);
if(temp__5735__auto___45402){
var seq__45235_45403__$1 = temp__5735__auto___45402;
if(cljs.core.chunked_seq_QMARK_(seq__45235_45403__$1)){
var c__4609__auto___45404 = cljs.core.chunk_first(seq__45235_45403__$1);
var G__45405 = cljs.core.chunk_rest(seq__45235_45403__$1);
var G__45406 = c__4609__auto___45404;
var G__45407 = cljs.core.count(c__4609__auto___45404);
var G__45408 = (0);
seq__45235_45391 = G__45405;
chunk__45236_45392 = G__45406;
count__45237_45393 = G__45407;
i__45238_45394 = G__45408;
continue;
} else {
var vec__45248_45409 = cljs.core.first(seq__45235_45403__$1);
var tag_45410 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45248_45409,(0),null);
var cb_45411 = cljs.core.nth.cljs$core$IFn$_invoke$arity$3(vec__45248_45409,(1),null);
cljs.reader.register_tag_parser_BANG_(tag_45410,cb_45411);


var G__45412 = cljs.core.next(seq__45235_45403__$1);
var G__45413 = null;
var G__45414 = (0);
var G__45415 = (0);
seq__45235_45391 = G__45412;
chunk__45236_45392 = G__45413;
count__45237_45393 = G__45414;
i__45238_45394 = G__45415;
continue;
}
} else {
}
}
break;
}
datascript.core.last_tempid = cljs.core.atom.cljs$core$IFn$_invoke$arity$1((-1000000));
/**
 * Allocates and returns an unique temporary id (a negative integer). Ignores `part`. Returns `x` if it is specified.
 *   
 * Exists for Datomic API compatibility. Prefer using negative integers directly if possible.
 */
datascript.core.tempid = (function datascript$core$tempid(var_args){
var G__45252 = arguments.length;
switch (G__45252) {
case 1:
return datascript.core.tempid.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
case 2:
return datascript.core.tempid.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.tempid.cljs$core$IFn$_invoke$arity$1 = (function (part){
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(part,new cljs.core.Keyword("db.part","tx","db.part/tx",-1480923213))){
return new cljs.core.Keyword("db","current-tx","db/current-tx",1600722132);
} else {
return cljs.core.swap_BANG_.cljs$core$IFn$_invoke$arity$2(datascript.core.last_tempid,cljs.core.dec);
}
}));

(datascript.core.tempid.cljs$core$IFn$_invoke$arity$2 = (function (part,x){
if(cljs.core._EQ_.cljs$core$IFn$_invoke$arity$2(part,new cljs.core.Keyword("db.part","tx","db.part/tx",-1480923213))){
return new cljs.core.Keyword("db","current-tx","db/current-tx",1600722132);
} else {
return x;
}
}));

(datascript.core.tempid.cljs$lang$maxFixedArity = 2);

/**
 * Does a lookup in tempids map, returning an entity id that tempid was resolved to.
 * 
 * Exists for Datomic API compatibility. Prefer using map lookup directly if possible.
 */
datascript.core.resolve_tempid = (function datascript$core$resolve_tempid(_db,tempids,tempid){
return cljs.core.get.cljs$core$IFn$_invoke$arity$2(tempids,tempid);
});
/**
 * Returns the underlying immutable database value from a connection.
 * 
 * Exists for Datomic API compatibility. Prefer using `@conn` directly if possible.
 */
datascript.core.db = (function datascript$core$db(conn){
if(datascript.core.conn_QMARK_(conn)){
} else {
throw (new Error("Assert failed: (conn? conn)"));
}

return cljs.core.deref(conn);
});
/**
 * Same as [[transact!]], but returns an immediately realized future.
 *   
 * Exists for Datomic API compatibility. Prefer using [[transact!]] if possible.
 */
datascript.core.transact = (function datascript$core$transact(var_args){
var G__45256 = arguments.length;
switch (G__45256) {
case 2:
return datascript.core.transact.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.transact.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.transact.cljs$core$IFn$_invoke$arity$2 = (function (conn,tx_data){
return datascript.core.transact.cljs$core$IFn$_invoke$arity$3(conn,tx_data,null);
}));

(datascript.core.transact.cljs$core$IFn$_invoke$arity$3 = (function (conn,tx_data,tx_meta){
if(datascript.core.conn_QMARK_(conn)){
} else {
throw (new Error("Assert failed: (conn? conn)"));
}

var res = datascript.core.transact_BANG_.cljs$core$IFn$_invoke$arity$3(conn,tx_data,tx_meta);
if((typeof datascript !== 'undefined') && (typeof datascript.core !== 'undefined') && (typeof datascript.core.t_datascript$core45267 !== 'undefined')){
} else {

/**
* @constructor
 * @implements {cljs.core.IDerefWithTimeout}
 * @implements {cljs.core.IPending}
 * @implements {cljs.core.IMeta}
 * @implements {cljs.core.IDeref}
 * @implements {cljs.core.IWithMeta}
*/
datascript.core.t_datascript$core45267 = (function (conn,tx_data,tx_meta,res,meta45268){
this.conn = conn;
this.tx_data = tx_data;
this.tx_meta = tx_meta;
this.res = res;
this.meta45268 = meta45268;
this.cljs$lang$protocol_mask$partition0$ = 491520;
this.cljs$lang$protocol_mask$partition1$ = 1;
});
(datascript.core.t_datascript$core45267.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = (function (_45269,meta45268__$1){
var self__ = this;
var _45269__$1 = this;
return (new datascript.core.t_datascript$core45267(self__.conn,self__.tx_data,self__.tx_meta,self__.res,meta45268__$1));
}));

(datascript.core.t_datascript$core45267.prototype.cljs$core$IMeta$_meta$arity$1 = (function (_45269){
var self__ = this;
var _45269__$1 = this;
return self__.meta45268;
}));

(datascript.core.t_datascript$core45267.prototype.cljs$core$IDeref$_deref$arity$1 = (function (_){
var self__ = this;
var ___$1 = this;
return self__.res;
}));

(datascript.core.t_datascript$core45267.prototype.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3 = (function (_,___$1,___$2){
var self__ = this;
var ___$3 = this;
return self__.res;
}));

(datascript.core.t_datascript$core45267.prototype.cljs$core$IPending$_realized_QMARK_$arity$1 = (function (_){
var self__ = this;
var ___$1 = this;
return true;
}));

(datascript.core.t_datascript$core45267.getBasis = (function (){
return new cljs.core.PersistentVector(null, 5, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Symbol(null,"conn","conn",1918841190,null),new cljs.core.Symbol(null,"tx-data","tx-data",-1720276008,null),new cljs.core.Symbol(null,"tx-meta","tx-meta",-1495152575,null),new cljs.core.Symbol(null,"res","res",245523648,null),new cljs.core.Symbol(null,"meta45268","meta45268",-1793817990,null)], null);
}));

(datascript.core.t_datascript$core45267.cljs$lang$type = true);

(datascript.core.t_datascript$core45267.cljs$lang$ctorStr = "datascript.core/t_datascript$core45267");

(datascript.core.t_datascript$core45267.cljs$lang$ctorPrWriter = (function (this__4428__auto__,writer__4429__auto__,opt__4430__auto__){
return cljs.core._write(writer__4429__auto__,"datascript.core/t_datascript$core45267");
}));

/**
 * Positional factory function for datascript.core/t_datascript$core45267.
 */
datascript.core.__GT_t_datascript$core45267 = (function datascript$core$__GT_t_datascript$core45267(conn__$1,tx_data__$1,tx_meta__$1,res__$1,meta45268){
return (new datascript.core.t_datascript$core45267(conn__$1,tx_data__$1,tx_meta__$1,res__$1,meta45268));
});

}

return (new datascript.core.t_datascript$core45267(conn,tx_data,tx_meta,res,cljs.core.PersistentArrayMap.EMPTY));
}));

(datascript.core.transact.cljs$lang$maxFixedArity = 3);

datascript.core.future_call = (function datascript$core$future_call(f){
var res = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(null);
var realized = cljs.core.atom.cljs$core$IFn$_invoke$arity$1(false);
setTimeout((function (){
cljs.core.reset_BANG_(res,(f.cljs$core$IFn$_invoke$arity$0 ? f.cljs$core$IFn$_invoke$arity$0() : f.call(null)));

return cljs.core.reset_BANG_(realized,true);
}),(0));

if((typeof datascript !== 'undefined') && (typeof datascript.core !== 'undefined') && (typeof datascript.core.t_datascript$core45274 !== 'undefined')){
} else {

/**
* @constructor
 * @implements {cljs.core.IDerefWithTimeout}
 * @implements {cljs.core.IPending}
 * @implements {cljs.core.IMeta}
 * @implements {cljs.core.IDeref}
 * @implements {cljs.core.IWithMeta}
*/
datascript.core.t_datascript$core45274 = (function (f,res,realized,meta45275){
this.f = f;
this.res = res;
this.realized = realized;
this.meta45275 = meta45275;
this.cljs$lang$protocol_mask$partition0$ = 491520;
this.cljs$lang$protocol_mask$partition1$ = 1;
});
(datascript.core.t_datascript$core45274.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = (function (_45276,meta45275__$1){
var self__ = this;
var _45276__$1 = this;
return (new datascript.core.t_datascript$core45274(self__.f,self__.res,self__.realized,meta45275__$1));
}));

(datascript.core.t_datascript$core45274.prototype.cljs$core$IMeta$_meta$arity$1 = (function (_45276){
var self__ = this;
var _45276__$1 = this;
return self__.meta45275;
}));

(datascript.core.t_datascript$core45274.prototype.cljs$core$IDeref$_deref$arity$1 = (function (_){
var self__ = this;
var ___$1 = this;
return cljs.core.deref(self__.res);
}));

(datascript.core.t_datascript$core45274.prototype.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3 = (function (_,___$1,timeout_val){
var self__ = this;
var ___$2 = this;
if(cljs.core.truth_(cljs.core.deref(self__.realized))){
return cljs.core.deref(self__.res);
} else {
return timeout_val;
}
}));

(datascript.core.t_datascript$core45274.prototype.cljs$core$IPending$_realized_QMARK_$arity$1 = (function (_){
var self__ = this;
var ___$1 = this;
return cljs.core.deref(self__.realized);
}));

(datascript.core.t_datascript$core45274.getBasis = (function (){
return new cljs.core.PersistentVector(null, 4, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Symbol(null,"f","f",43394975,null),new cljs.core.Symbol(null,"res","res",245523648,null),new cljs.core.Symbol(null,"realized","realized",1487343404,null),new cljs.core.Symbol(null,"meta45275","meta45275",-967321289,null)], null);
}));

(datascript.core.t_datascript$core45274.cljs$lang$type = true);

(datascript.core.t_datascript$core45274.cljs$lang$ctorStr = "datascript.core/t_datascript$core45274");

(datascript.core.t_datascript$core45274.cljs$lang$ctorPrWriter = (function (this__4428__auto__,writer__4429__auto__,opt__4430__auto__){
return cljs.core._write(writer__4429__auto__,"datascript.core/t_datascript$core45274");
}));

/**
 * Positional factory function for datascript.core/t_datascript$core45274.
 */
datascript.core.__GT_t_datascript$core45274 = (function datascript$core$future_call_$___GT_t_datascript$core45274(f__$1,res__$1,realized__$1,meta45275){
return (new datascript.core.t_datascript$core45274(f__$1,res__$1,realized__$1,meta45275));
});

}

return (new datascript.core.t_datascript$core45274(f,res,realized,cljs.core.PersistentArrayMap.EMPTY));
});
/**
 * In CLJ, calls [[transact!]] on a future thread pool, returning immediately.
 *   
 * In CLJS, just calls [[transact!]] and returns a realized future.
 */
datascript.core.transact_async = (function datascript$core$transact_async(var_args){
var G__45278 = arguments.length;
switch (G__45278) {
case 2:
return datascript.core.transact_async.cljs$core$IFn$_invoke$arity$2((arguments[(0)]),(arguments[(1)]));

break;
case 3:
return datascript.core.transact_async.cljs$core$IFn$_invoke$arity$3((arguments[(0)]),(arguments[(1)]),(arguments[(2)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.transact_async.cljs$core$IFn$_invoke$arity$2 = (function (conn,tx_data){
return datascript.core.transact_async.cljs$core$IFn$_invoke$arity$3(conn,tx_data,null);
}));

(datascript.core.transact_async.cljs$core$IFn$_invoke$arity$3 = (function (conn,tx_data,tx_meta){
if(datascript.core.conn_QMARK_(conn)){
} else {
throw (new Error("Assert failed: (conn? conn)"));
}

return datascript.core.future_call((function (){
return datascript.core.transact_BANG_.cljs$core$IFn$_invoke$arity$3(conn,tx_data,tx_meta);
}));
}));

(datascript.core.transact_async.cljs$lang$maxFixedArity = 3);

datascript.core.rand_bits = (function datascript$core$rand_bits(pow){
return cljs.core.rand_int(((1) << pow));
});
datascript.core.to_hex_string = (function datascript$core$to_hex_string(n,l){
var s = n.toString((16));
var c = cljs.core.count(s);
if((c > l)){
return cljs.core.subs.cljs$core$IFn$_invoke$arity$3(s,(0),l);
} else {
if((c < l)){
return [cljs.core.str.cljs$core$IFn$_invoke$arity$1(cljs.core.apply.cljs$core$IFn$_invoke$arity$2(cljs.core.str,cljs.core.repeat.cljs$core$IFn$_invoke$arity$2((l - c),"0"))),cljs.core.str.cljs$core$IFn$_invoke$arity$1(s)].join('');
} else {
return s;

}
}
});
/**
 * Generates a UUID that grow with time. Such UUIDs will always go to the end  of the index and that will minimize insertions in the middle.
 *   
 * Consist of 64 bits of current UNIX timestamp (in seconds) and 64 random bits (2^64 different unique values per second).
 */
datascript.core.squuid = (function datascript$core$squuid(var_args){
var G__45280 = arguments.length;
switch (G__45280) {
case 0:
return datascript.core.squuid.cljs$core$IFn$_invoke$arity$0();

break;
case 1:
return datascript.core.squuid.cljs$core$IFn$_invoke$arity$1((arguments[(0)]));

break;
default:
throw (new Error(["Invalid arity: ",cljs.core.str.cljs$core$IFn$_invoke$arity$1(arguments.length)].join('')));

}
});

(datascript.core.squuid.cljs$core$IFn$_invoke$arity$0 = (function (){
return datascript.core.squuid.cljs$core$IFn$_invoke$arity$1((new Date()).getTime());
}));

(datascript.core.squuid.cljs$core$IFn$_invoke$arity$1 = (function (msec){
return cljs.core.uuid([cljs.core.str.cljs$core$IFn$_invoke$arity$1(datascript.core.to_hex_string(((msec / (1000)) | (0)),(8))),"-",cljs.core.str.cljs$core$IFn$_invoke$arity$1(datascript.core.to_hex_string(datascript.core.rand_bits((16)),(4))),"-",cljs.core.str.cljs$core$IFn$_invoke$arity$1(datascript.core.to_hex_string(((datascript.core.rand_bits((16)) & (4095)) | (16384)),(4))),"-",cljs.core.str.cljs$core$IFn$_invoke$arity$1(datascript.core.to_hex_string(((datascript.core.rand_bits((16)) & (16383)) | (32768)),(4))),"-",cljs.core.str.cljs$core$IFn$_invoke$arity$1(datascript.core.to_hex_string(datascript.core.rand_bits((16)),(4))),cljs.core.str.cljs$core$IFn$_invoke$arity$1(datascript.core.to_hex_string(datascript.core.rand_bits((16)),(4))),cljs.core.str.cljs$core$IFn$_invoke$arity$1(datascript.core.to_hex_string(datascript.core.rand_bits((16)),(4)))].join(''));
}));

(datascript.core.squuid.cljs$lang$maxFixedArity = 1);

/**
 * Returns time that was used in [[squuid]] call, in milliseconds, rounded to the closest second.
 */
datascript.core.squuid_time_millis = (function datascript$core$squuid_time_millis(uuid){
return (parseInt(cljs.core.subs.cljs$core$IFn$_invoke$arity$3(cljs.core.str.cljs$core$IFn$_invoke$arity$1(uuid),(0),(8)),(16)) * (1000));
});

//# sourceMappingURL=datascript.core.js.map
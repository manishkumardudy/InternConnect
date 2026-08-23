const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to generate a 24-character hex ID (similar to MongoDB ObjectId)
function generateObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machineId = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const processId = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return timestamp + machineId + processId + counter;
}

// Deep clone helper to avoid reference sharing
function clone(obj) {
  if (obj === undefined) return undefined;
  return JSON.parse(JSON.stringify(obj));
}

// Evaluates a MongoDB-like query on a record
function matchesQuery(record, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key in query) {
    const val = query[key];

    // Handle logical operators
    if (key === '$or') {
      if (!Array.isArray(val)) return false;
      return val.some(subQuery => matchesQuery(record, subQuery));
    }
    if (key === '$and') {
      if (!Array.isArray(val)) return false;
      return val.every(subQuery => matchesQuery(record, subQuery));
    }

    const recordVal = record[key];

    // If query value is an object (operator)
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      for (const op in val) {
        const opVal = val[op];
        if (op === '$regex') {
          const flags = val['$options'] || 'i';
          const regex = new RegExp(opVal, flags);
          if (!regex.test(String(recordVal || ''))) return false;
        } else if (op === '$options') {
          // Handled alongside $regex
          continue;
        } else if (op === '$in') {
          if (!Array.isArray(opVal)) return false;
          // Support array fields like skills where we check intersection, or scalar field matching any in array
          if (Array.isArray(recordVal)) {
            const hasIntersection = recordVal.some(item => opVal.includes(item));
            if (!hasIntersection) return false;
          } else {
            if (!opVal.includes(recordVal)) return false;
          }
        } else if (op === '$nin') {
          if (!Array.isArray(opVal)) return false;
          if (opVal.includes(recordVal)) return false;
        } else if (op === '$gte') {
          const rDate = recordVal instanceof Date ? recordVal : new Date(recordVal);
          const oDate = opVal instanceof Date ? opVal : new Date(opVal);
          if (!isNaN(rDate.getTime()) && !isNaN(oDate.getTime())) {
            if (!(rDate >= oDate)) return false;
          } else if (!(recordVal >= opVal)) return false;
        } else if (op === '$lte') {
          const rDate = recordVal instanceof Date ? recordVal : new Date(recordVal);
          const oDate = opVal instanceof Date ? opVal : new Date(opVal);
          if (!isNaN(rDate.getTime()) && !isNaN(oDate.getTime())) {
            if (!(rDate <= oDate)) return false;
          } else if (!(recordVal <= opVal)) return false;
        } else if (op === '$gt') {
          const rDate = recordVal instanceof Date ? recordVal : new Date(recordVal);
          const oDate = opVal instanceof Date ? opVal : new Date(opVal);
          if (!isNaN(rDate.getTime()) && !isNaN(oDate.getTime())) {
            if (!(rDate > oDate)) return false;
          } else if (!(recordVal > opVal)) return false;
        } else if (op === '$lt') {
          const rDate = recordVal instanceof Date ? recordVal : new Date(recordVal);
          const oDate = opVal instanceof Date ? opVal : new Date(opVal);
          if (!isNaN(rDate.getTime()) && !isNaN(oDate.getTime())) {
            if (!(rDate < oDate)) return false;
          } else if (!(recordVal < opVal)) return false;
        } else if (op === '$ne') {
          if (String(recordVal) === String(opVal)) return false;
        } else if (op === '$all') {
          if (!Array.isArray(recordVal) || !Array.isArray(opVal)) return false;
          const allMatch = opVal.every(item => recordVal.includes(item));
          if (!allMatch) return false;
        }
      }
    } else {
      // Direct comparison
      if (Array.isArray(recordVal)) {
        if (!recordVal.some(item => String(item) === String(val))) return false;
      } else {
        if (String(recordVal) !== String(val)) return false;
      }
    }
  }
  return true;
}

// Chainable query builder
class QueryBuilder {
  constructor(collection, filter = {}, single = false) {
    this.collection = collection;
    this.filter = filter;
    this.single = single;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._populatePaths = [];
  }

  sort(criteria) {
    this._sort = criteria;
    return this;
  }

  skip(n) {
    this._skip = parseInt(n) || 0;
    return this;
  }

  limit(n) {
    this._limit = parseInt(n) || null;
    return this;
  }

  populate(pathName) {
    // pathName can be a string or object like { path: 'userId' } or nested string
    if (typeof pathName === 'string') {
      this._populatePaths.push(pathName);
    } else if (pathName && typeof pathName === 'object' && pathName.path) {
      this._populatePaths.push(pathName.path);
    }
    return this;
  }

  // Executes query and returns results
  async exec() {
    let records = this.collection._readAll();
    let matches = records.filter(r => matchesQuery(r, this.filter));

    // Sort if specified
    if (this._sort) {
      matches.sort((a, b) => {
        for (const field in this._sort) {
          const order = this._sort[field] === -1 || this._sort[field] === 'desc' ? -1 : 1;
          const valA = a[field];
          const valB = b[field];
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
        }
        return 0;
      });
    }

    // Skip
    if (this._skip > 0) {
      matches = matches.slice(this._skip);
    }

    // Limit
    if (this._limit !== null && this._limit >= 0) {
      matches = matches.slice(0, this._limit);
    }

    // Populate relations
    if (this._populatePaths.length > 0) {
      for (const record of matches) {
        await this._populateRecord(record);
      }
    }

    if (this.single) {
      return matches.length > 0 ? clone(matches[0]) : null;
    }
    return clone(matches);
  }

  async _populateRecord(record) {
    for (const popPath of this._populatePaths) {
      const targetId = record[popPath];
      if (!targetId) continue;

      let refCollection = null;
      // Map properties to collections
      if (popPath === 'userId' || popPath === 'studentId' || popPath === 'requesterId' || popPath === 'recipientId') {
        refCollection = 'users';
      } else if (popPath === 'companyId') {
        refCollection = 'companies';
      } else if (popPath === 'listingId') {
        refCollection = 'listings';
      }

      if (refCollection) {
        const dbPath = path.join(DATA_DIR, `${refCollection}.json`);
        if (fs.existsSync(dbPath)) {
          const list = JSON.parse(fs.readFileSync(dbPath, 'utf8') || '[]');
          if (Array.isArray(targetId)) {
            record[popPath] = targetId.map(id => list.find(item => String(item._id) === String(id))).filter(Boolean);
          } else {
            record[popPath] = list.find(item => String(item._id) === String(targetId)) || null;
          }
        }
      }
    }
  }

  // Thenable interface to allow direct awaiting on QueryBuilder instances
  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }
}

class LocalCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
  }

  _readAll() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf8');
      return [];
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`Error reading database file: ${this.filePath}`, e);
      return [];
    }
  }

  _writeAll(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  find(query = {}) {
    return new QueryBuilder(this, query, false);
  }

  findOne(query = {}) {
    return new QueryBuilder(this, query, true);
  }

  findById(id) {
    return new QueryBuilder(this, { _id: String(id) }, true);
  }

  async create(data) {
    const list = this._readAll();
    const now = new Date().toISOString();
    const doc = {
      _id: generateObjectId(),
      ...clone(data),
      createdAt: now,
      updatedAt: now
    };
    list.push(doc);
    this._writeAll(list);
    return clone(doc);
  }

  async insertMany(docsArray) {
    const list = this._readAll();
    const now = new Date().toISOString();
    const createdDocs = docsArray.map(data => ({
      _id: generateObjectId(),
      ...clone(data),
      createdAt: now,
      updatedAt: now
    }));
    list.push(...createdDocs);
    this._writeAll(list);
    return clone(createdDocs);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = this._readAll();
    const index = list.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;

    const currentDoc = list[index];
    const now = new Date().toISOString();
    
    // Support update operators like $set or regular update object
    let finalUpdate = {};
    if (update.$set) {
      finalUpdate = { ...currentDoc, ...update.$set, updatedAt: now };
    } else {
      finalUpdate = { ...currentDoc, ...update, updatedAt: now };
    }

    list[index] = finalUpdate;
    this._writeAll(list);
    return clone(finalUpdate);
  }

  async findOneAndUpdate(query, update, options = {}) {
    const list = this._readAll();
    const index = list.findIndex(item => matchesQuery(item, query));
    if (index === -1) {
      if (options.upsert) {
        return this.create({ ...query, ...update });
      }
      return null;
    }

    const currentDoc = list[index];
    const now = new Date().toISOString();
    
    let finalUpdate = {};
    if (update.$set) {
      finalUpdate = { ...currentDoc, ...update.$set, updatedAt: now };
    } else if (update.$push) {
      // Simulate mongo push operator for arrays
      finalUpdate = { ...currentDoc, updatedAt: now };
      for (const field in update.$push) {
        if (!Array.isArray(finalUpdate[field])) {
          finalUpdate[field] = [];
        }
        finalUpdate[field].push(update.$push[field]);
      }
    } else {
      finalUpdate = { ...currentDoc, ...update, updatedAt: now };
    }

    list[index] = finalUpdate;
    this._writeAll(list);
    return clone(finalUpdate);
  }

  async deleteOne(query) {
    const list = this._readAll();
    const index = list.findIndex(item => matchesQuery(item, query));
    if (index === -1) return { deletedCount: 0 };
    list.splice(index, 1);
    this._writeAll(list);
    return { deletedCount: 1 };
  }

  async deleteMany(query) {
    const list = this._readAll();
    const initialLen = list.length;
    const remaining = list.filter(item => !matchesQuery(item, query));
    this._writeAll(remaining);
    return { deletedCount: initialLen - remaining.length };
  }

  async countDocuments(query = {}) {
    const list = this._readAll();
    return list.filter(item => matchesQuery(item, query)).length;
  }
}

// Export models mimicking mongoose models
module.exports = {
  User: new LocalCollection('users'),
  StudentProfile: new LocalCollection('studentprofiles'),
  Company: new LocalCollection('companies'),
  Listing: new LocalCollection('listings'),
  Application: new LocalCollection('applications'),
  Notification: new LocalCollection('notifications'),
  Friend: new LocalCollection('friends'),
  Post: new LocalCollection('posts'),
  Subscription: new LocalCollection('subscriptions'),
  Otp: new LocalCollection('otps'),
  GeneratedResume: new LocalCollection('generatedresumes'),
  LoginHistory: new LocalCollection('loginhistories'),
  isMockDb: true
};

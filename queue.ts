/**
 * Question 1
 */
interface IQueuable {
  //adds value to queue and returns new queue
  enqueue(value: string): string[];

  //removes item from queue, and returns the item removed
  dequeue(): string | undefined;

  //returns a list of all the items in the queue
  getQueue(): string[];

  //returns the number of items in the queue
  size(): number;
}

class FIFOQUEUE implements IQueuable {
  private queueArray: string[] = [];

  enqueue(value: string): string[] {
    this.queueArray.push(value);
    return this.getQueue();
  }

  dequeue(): string | undefined {
    // terrible design as shift is processing on O(n) amount of times for shifting the array -1 elements
    return this.queueArray.shift();
  }

  getQueue(): string[] {
    return this.queueArray;
  }

  size(): number {
    return this.queueArray.length;
  }
}

class LIFOQUEUE implements IQueuable {
  private queueArray: string[] = [];

  enqueue(value: string): string[] {
    this.queueArray.push(value);
    return this.getQueue();
  }

  dequeue(): string | undefined {
    return this.queueArray.pop();
  }

  getQueue(): string[] {
    return this.queueArray;
  }

  size(): number {
    return this.queueArray.length;
  }
}

/**
 *  Question 2
 */
interface queueObject {
  [name: number]: string;
}

class FIFOQUEUE_V2 implements IQueuable {
  private queueArray: queueObject = {};
  private first: number = 0;
  private last: number = 0;

  enqueue(value: string): string[] {
    this.queueArray[this.last++] = value;
    return this.getQueue();
  }

  dequeue(): string | undefined {
    if (this.first === this.last) return;
    let value = this.queueArray[this.first];
    delete this.queueArray[this.first];
    this.first++;
    return value;
  }

  getQueue(): string[] {
    // queue will return according to the key number, which is on numeric sequence
    return Object.values(this.queueArray);
  }

  size(): number {
    return Object.values(this.queueArray).length;
  }
}

class LIFOQUEUE_V2 implements IQueuable {
  private queueArray: queueObject = {};
  private last: number = 0;

  enqueue(value: string): string[] {
    this.queueArray[this.last++] = value;
    return this.getQueue();
  }

  dequeue(): string | undefined {
    if (this.last === 0) return;
    let value = this.queueArray[this.last - 1];
    delete this.queueArray[this.last - 1];
    this.last--;
    return value;
  }

  getQueue(): string[] {
    // queue will return according to the key number, which is on numeric sequence
    return Object.values(this.queueArray);
  }

  size(): number {
    return this.last;
  }
}

/**
 * Question 3
 *
 * The example below adapter design pattern should be good
 */
enum Type {
  FIFO,
  LIFO,
}

// interfaces
interface TypeAdaptee {
  get getType(): Type;
}

interface StoreAdaptee {
  getAll(): string[];
  getOne(type: Type): string | undefined;
  addOne(value: string): void;
  delOne(type: Type): void;
}

// Store Adaptees ( IRL scenario, redis / db etc )
class ObjectStoreAdaptee implements StoreAdaptee {
  protected listObject: string[] = [];
  protected first: number = 0;
  protected last: number = 0;

  getAll(): string[] {
    return this.listObject;
  }

  getOne(type: Type): string | undefined {
    if (this.first === this.last) return undefined;

    switch (type) {
      case Type.FIFO:
        return this.listObject[this.first];

      case Type.LIFO:
        return this.listObject[this.last - 1];

      default:
        return undefined;
    }
  }

  addOne(value: string): void {
    this.listObject[this.last++] = value;
  }

  delOne(type: Type): void {
    if (this.first === this.last) return;

    switch (type) {
      case Type.FIFO:
        this.listObject[this.first++];
        break;

      case Type.LIFO:
        this.listObject[this.last--];
        break;

      default:
        break;
    }

    return;
  }
}

class ArrayStoreAdaptee implements StoreAdaptee {
  protected queueArray: string[] = [];

  getAll(): string[] {
    return this.queueArray;
  }

  getOne(type: Type): string | undefined {
    if (this.queueArray.length === 0) return undefined;

    switch (type) {
      case Type.FIFO:
        return this.queueArray[0];

      case Type.LIFO:
        return this.queueArray[this.queueArray.length - 1];

      default:
        return undefined;
    }
  }

  addOne(value: string): void {
    this.queueArray.push(value);
  }

  delOne(type: Type): void {
    switch (type) {
      case Type.FIFO:
        this.queueArray.shift();
        break;

      case Type.LIFO:
        this.queueArray.pop();
        break;

      default:
        break;
    }
  }
}

// Insertion Adaptees
class FifoAdaptee implements TypeAdaptee {
  public get getType() {
    return Type.FIFO;
  }
}

class LifoAdaptee implements TypeAdaptee {
  public get getType() {
    return Type.LIFO;
  }
}

class QueueAdapter implements IQueuable {
  private storeAdaptee: StoreAdaptee;
  private typeAdaptee: TypeAdaptee;

  constructor(storeAdaptee: StoreAdaptee, typeAdaptee: TypeAdaptee) {
    this.storeAdaptee = storeAdaptee;
    this.typeAdaptee = typeAdaptee;
  }

  enqueue(value: string): string[] {
    this.storeAdaptee.addOne(value);
    return this.storeAdaptee.getAll();
  }

  dequeue(): string | undefined {
    const value = this.storeAdaptee.getOne(this.typeAdaptee.getType);
    this.storeAdaptee.delOne(this.typeAdaptee.getType);
    return value;
  }

  getQueue(): string[] {
    return this.storeAdaptee.getAll();
  }

  size(): number {
    return this.storeAdaptee.getAll().length;
  }
}

// Execute
const lifoAdaptee = new LifoAdaptee();
const arrayStoreAdaptee = new ArrayStoreAdaptee();
const adapter = new QueueAdapter(arrayStoreAdaptee, lifoAdaptee);

// inserting
adapter.enqueue("this is first string");
adapter.enqueue("this is second string");
adapter.getQueue(); // return ['this is first string', 'this is second string']
adapter.size(); // return 2;

// removing
adapter.dequeue(); // return 'this is second string'
adapter.getQueue(); // return ['this is first string']
adapter.size(); // return 1;

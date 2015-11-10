class Manager{

  constructor(){
    this.queue = [];
    this.listeners = undefined;
  }
  push(value){
    this.queue.push(value);
  },
  listen(obj){
    this.listener = obj;
  },
  flush(){
    var list = this.queue;
    this.queue = [];
    list.forEach(this.listener.handle.bind(this.listener));
  }
}


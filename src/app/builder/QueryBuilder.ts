

import mongoose, { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }


  // search(searchableFields: string[]) {

  //   const searchTerm = this?.query?.searchTerm || this?.query?.search;

  //   if (searchTerm) {
  //     this.modelQuery = this.modelQuery.find({
  //       $or: searchableFields.map(
  //         (field) =>
  //           ({
  //             [field]: { $regex: searchTerm, $options: 'i' },
  //           }) as FilterQuery<T>,
  //       ),
  //     });
  //   }


  //   return this;
  // }

  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm || this.query.search;

    // Determine if user passed field-specific query
    const specificFieldsQuery = Object.keys(this.query).filter(
      (key) => !['search', 'searchTerm', 'sort', 'page', 'limit', 'fields'].includes(key)
    );

    console.log("searchableFields", searchableFields);
    console.log('specificFieldsQuery', specificFieldsQuery);

    const filters: any[] = [];

    // Add searchTerm across all searchable fields
    if (searchTerm) {
      filters.push({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      });
    }

    // Add specific field filters
    if (specificFieldsQuery.length) {
      specificFieldsQuery.forEach((key) => {
        console.log('key', key);
        console.log('this.query[key]', this.query[key]);

        const value = String(this.query[key]); // convert to string
        filters.push({ [key]: { $regex: value, $options: 'i' } });
      });
    }

    console.dir(filters, {depth: null, colors: true});
    // console.log('filters', filters);
    // Apply combined filters
    if (filters.length) {
      this.modelQuery = this.modelQuery.find({ $and: filters });
    }


    return this;
}


    // ✅ Custom Search Support (for chat name search, custom populate logic)
  customSearch(searchFn: (query: Query<T[], T>, searchTerm: string) => void) {
    const searchTerm = (this.query.search as string) || (this.query.searchTerm as string);
    if (searchTerm) {
      searchFn(this.modelQuery, searchTerm);
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query }; //copy

  
    // filtering
    const excludeFields = ['search','searchTerm', 'sort', 'limit', 'page', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    console.log({queryObj});

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  sort(sortBy?:string) {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || sortBy || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQuery = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQuery);

    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;

    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
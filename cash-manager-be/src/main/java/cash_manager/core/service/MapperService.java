package cash_manager.core.service;

import org.modelmapper.ModelMapper;

import java.util.List;

import cash_manager.core.commons.utils.PagedList;

public interface MapperService {

	ModelMapper getMapper();

	<D> D map(Object source, Class<D> destinationType);

	<D> void map(Object source, D destinationObject);

	<D> List<D> mapAll(List<? extends Object> source, Class<D> destinationType);

	<D> PagedList<D> mapPagedList(PagedList<? extends Object> source, Class<D> destinationType);
}


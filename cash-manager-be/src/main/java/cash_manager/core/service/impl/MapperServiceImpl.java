package cash_manager.core.service.impl;
import org.modelmapper.ModelMapper;
import cash_manager.core.service.MapperService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import cash_manager.core.commons.utils.PagedList;

public class MapperServiceImpl implements MapperService {

	private ModelMapper mapper;

	public MapperServiceImpl() {
		this.mapper = new ModelMapper();
	}

	@Override
	public ModelMapper getMapper() {
		return this.mapper;
	}

	@Override
	public <D> D map(Object source, Class<D> destinationType) {
		return mapper.map(source, destinationType);
	}

	@Override
	public <D> void map(Object source, D destinationObject) {
		mapper.map(source, destinationObject);
	}

	@Override
	public <D> List<D> mapAll(List<? extends Object> source, Class<D> destinationType) {
		List<D> output = new ArrayList<>();
		if (source != null) {

			return source.stream().map(elem -> map(elem, destinationType)).collect(Collectors.toList());

		}

		return output;
	}

	@Override
	public <D> PagedList<D> mapPagedList(PagedList<? extends Object> source, Class<D> destinationType) {
		List<D> mappedItems = mapAll(source.getItems(), destinationType);
		return new PagedList<>(mappedItems, source.getTotalItems());
	}

}
